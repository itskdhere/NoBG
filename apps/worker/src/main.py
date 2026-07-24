import os
import io
import json
import logging
import asyncio
import functools
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from PIL import Image
from rembg import remove, new_session
import redis.asyncio as aioredis
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from .config import MODEL_NAME, PREFIX

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL")
WEB_APP_URL = os.getenv("WEB_APP_URL")

if not REDIS_URL:
    logger.error("REDIS_URL is not set. Worker will fail to start.")
    exit(1)

if not WEB_APP_URL:
    logger.error("WEB_APP_URL is not set. Worker will fail to upload.")
    exit(1)

WORKER_SECRET = os.getenv("WORKER_SECRET")

r = aioredis.from_url(
    REDIS_URL,
    decode_responses=True,
    socket_timeout=15.0,
    socket_connect_timeout=10.0,
    socket_keepalive=True,
    health_check_interval=15,
    retry_on_timeout=True,
)

session = new_session(MODEL_NAME)

cpu_semaphore = asyncio.Semaphore(1)
cpu_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="cpu_worker")

network_semaphore = asyncio.Semaphore(5)


async def upload_to_uploadthing(client: httpx.AsyncClient, image_bytes: bytes, filename: str) -> str:
    url = f"{WEB_APP_URL}/api/worker/upload"
    
    files = {"file": (filename, image_bytes, "image/png")}
    headers = {"Authorization": f"Bearer {WORKER_SECRET}"} if WORKER_SECRET else {}
    
    response = await client.post(url, files=files, headers=headers, timeout=60.0)

    if response.status_code != 200:
        logger.error(f"Worker Upload API error: {response.status_code} - {response.text}")
        response.raise_for_status()

    data = response.json()
    blob_url = data.get("url")

    if not blob_url:
        raise ValueError("Worker Upload API did not return a URL")

    logger.info(f"Successfully uploaded to Uploadthing: {blob_url}")
    return blob_url


async def process_job(job_data_str: str):
    job_id = None
    try:
        job = json.loads(job_data_str)
        job_id = job["id"]
        source_url = job["url"]
        original_filename = job.get("filename", "image.png")

        logger.info(f"Processing job {job_id} from {source_url}")

        async with httpx.AsyncClient() as client:
            response = await client.get(source_url, timeout=30.0)
            response.raise_for_status()

            await r.hset(f"{PREFIX}:job_status:{job_id}", mapping={"status": "processing"})

            loop = asyncio.get_running_loop()
            async with cpu_semaphore:
                input_image = await loop.run_in_executor(
                    cpu_executor, Image.open, io.BytesIO(response.content)
                )
                output_image = await loop.run_in_executor(
                    cpu_executor, functools.partial(remove, session=session), input_image
                )
                img_byte_arr = io.BytesIO()
                await loop.run_in_executor(
                    cpu_executor, output_image.save, img_byte_arr, "PNG"
                )
                img_bytes = img_byte_arr.getvalue()

            name_parts = original_filename.rsplit(".", 1)
            if len(name_parts) == 2:
                base_name, ext = name_parts
                filename = f"{base_name}-nobg.{ext}"
            else:
                filename = f"{original_filename}-nobg.png"

            result_url = await upload_to_uploadthing(client, img_bytes, filename)

            await r.hset(
                f"{PREFIX}:job_status:{job_id}",
                mapping={
                    "status": "completed",
                    "result_url": result_url,
                    "sourceUrl": source_url,
                    "filename": original_filename,
                },
            )
            await r.expire(f"{PREFIX}:job_status:{job_id}", 3600)

            logger.info(f"Job {job_id} completed successfully. URL: {result_url}")

    except Exception as e:
        logger.error(f"Error processing job: {str(e)}")
        if job_id:
            try:
                await r.hset(f"{PREFIX}:job_status:{job_id}", mapping={"status": "failed"})
                await r.expire(f"{PREFIX}:job_status:{job_id}", 3600)
            except Exception as redis_err:
                logger.error(f"Failed to update failed status in Redis: {str(redis_err)}")


async def worker_loop():
    logger.info(f"Starting Redis worker loop... Listening on queue: {PREFIX}:job_queue")
    while True:
        try:
            await network_semaphore.acquire()
            try:
                result = await r.brpop(f"{PREFIX}:job_queue", timeout=5)
                if result:
                    _, job_data_str = result
                    
                    async def run_and_release():
                        try:
                            await process_job(job_data_str)
                        finally:
                            network_semaphore.release()
                            
                    asyncio.create_task(run_and_release())
                else:
                    network_semaphore.release()
                    await asyncio.sleep(0.1)
            except Exception as inner_e:
                network_semaphore.release()
                raise inner_e
                
        except asyncio.CancelledError:
            logger.info("Worker loop cancelled.")
            break
        except (aioredis.TimeoutError, aioredis.ConnectionError, asyncio.TimeoutError) as te:
            logger.warning(f"Redis connection timeout/reset (reconnecting...): {str(te)}")
            await asyncio.sleep(2)
        except Exception as e:
            logger.error(f"Redis connection/worker loop error: {str(e)}")
            await asyncio.sleep(5)


@asynccontextmanager
async def lifespan(app: FastAPI):
    worker_task = asyncio.create_task(worker_loop())
    yield
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass
    cpu_executor.shutdown(wait=True)


app = FastAPI(title="NoBG Worker", lifespan=lifespan)


@app.get("/")
def health_check():
    return {"status": "Ok", "message": "NoBG Worker is Running"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

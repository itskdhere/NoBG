import os
import io
import json
import time
import logging
import threading
import requests
import redis
from PIL import Image
from rembg import remove, new_session
from fastapi import FastAPI
from .config import MODEL_NAME, PREFIX

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL")
BLOB_READ_WRITE_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN")

if not REDIS_URL:
    logger.warning("REDIS_URL is not set. Worker will fail to connect.")

if not BLOB_READ_WRITE_TOKEN:
    logger.warning("BLOB_READ_WRITE_TOKEN is not set. Worker will fail to upload.")

r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

session = new_session(MODEL_NAME)

app = FastAPI(title="NoBG Worker API")


def upload_to_vercel_blob(image_bytes: bytes, filename: str) -> str:
    token = os.getenv("BLOB_READ_WRITE_TOKEN")
    if not token:
        raise ValueError("BLOB_READ_WRITE_TOKEN environment variable is missing.")

    url = f"https://blob.vercel-storage.com/{filename}"

    headers = {
        "Authorization": f"Bearer {token}",
        "X-Content-Type": "image/png",
    }

    response = requests.put(url, headers=headers, data=image_bytes)

    if response.status_code not in (200, 201):
        logger.error(f"Vercel Blob API error: {response.status_code} - {response.text}")
        response.raise_for_status()

    data = response.json()
    blob_url = data.get("url")

    if not blob_url:
        raise ValueError("Vercel Blob API did not return a URL")

    logger.info(f"Successfully uploaded to Vercel Blob: {blob_url}")
    return blob_url


def process_job(job_data_str: str):
    try:
        job = json.loads(job_data_str)
        job_id = job["id"]
        source_url = job["url"]
        original_filename = job.get("filename", "image.png")

        logger.info(f"Processing job {job_id} from {source_url}")

        response = requests.get(source_url)
        response.raise_for_status()

        r.hset(f"{PREFIX}:job_status:{job_id}", mapping={"status": "processing"})

        input_image = Image.open(io.BytesIO(response.content))
        output_image = remove(input_image, session=session)

        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format="PNG")
        img_bytes = img_byte_arr.getvalue()

        name_parts = original_filename.rsplit(".", 1)
        if len(name_parts) == 2:
            base_name, ext = name_parts
            filename = f"{base_name}-nobg.{ext}"
        else:
            filename = f"{original_filename}-nobg.png"

        result_url = upload_to_vercel_blob(img_bytes, filename)

        r.hset(
            f"{PREFIX}:job_status:{job_id}",
            mapping={"status": "completed", "result_url": result_url},
        )
        r.expire(f"{PREFIX}:job_status:{job_id}", 3600)

        logger.info(f"Job {job_id} completed successfully. URL: {result_url}")

    except Exception as e:
        logger.error(f"Error processing job: {str(e)}")
        if "job_id" in locals():
            r.hset(f"{PREFIX}:job_status:{job_id}", mapping={"status": "failed"})
            r.expire(f"{PREFIX}:job_status:{job_id}", 3600)


def worker_loop():
    logger.info(f"Starting Redis worker loop... Listening on queue: {PREFIX}:job_queue")
    while True:
        try:
            result = r.brpop(f"{PREFIX}:job_queue", timeout=0)
            if result:
                _, job_data_str = result
                process_job(job_data_str)
        except Exception as e:
            logger.error(f"Redis connection/worker loop error: {str(e)}")
            time.sleep(5)


@app.on_event("startup")
def startup_event():
    thread = threading.Thread(target=worker_loop, daemon=True)
    thread.start()


@app.get("/")
def health_check():
    return {"status": "Ok", "message": "NoBG Worker is Running"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

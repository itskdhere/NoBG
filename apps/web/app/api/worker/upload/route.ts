import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { prisma } from "@/lib/prisma";
import { redis, PREFIX } from "@/lib/redis";

export async function POST(req: NextRequest) {
  const workerSecret = process.env.WORKER_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!workerSecret || authHeader !== `Bearer ${workerSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const utapi = new UTApi();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const jobId = formData.get("jobId") as string | null;
    const userId = formData.get("userId") as string | null;
    const sourceUrl = formData.get("sourceUrl") as string | null;
    const originalName = formData.get("originalName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const res = await utapi.uploadFiles(file);

    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }

    const resultUrl = res.data.ufsUrl;

    if (userId && jobId) {
      try {
        await prisma.processedImage.create({
          data: {
            userId,
            originalName: originalName || "image.png",
            sourceUrl: sourceUrl || "",
            resultUrl,
          },
        });

        const key = `${PREFIX}:job_status:${jobId}`;
        await redis.hSet(key, "savedToDb", "true");
      } catch (dbError) {
        console.error(
          "[Worker Upload] Failed to persist processed image to database:",
          dbError
        );
      }
    }

    return NextResponse.json({ url: resultUrl });
  } catch (error) {
    console.error("Worker upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

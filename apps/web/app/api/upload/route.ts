import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/lib/auth";
import { redis, PREFIX } from "@/lib/redis";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth.api.getSession({
          headers: await headers(),
        });

        if (!session) {
          throw new Error("Unauthorized");
        }

        const jobId = pathname.substring(0, 36);

        await redis.hSet(`${PREFIX}:job_status:${jobId}`, {
          status: "uploading",
          userId: session.user.id,
        });

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
          ],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            jobId,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          if (!tokenPayload) {
            throw new Error("No token payload found");
          }

          const payload = JSON.parse(tokenPayload);
          const { userId, jobId } = payload;

          if (!userId || !jobId) {
            throw new Error("Invalid token payload");
          }

          const filename = blob.pathname.replace(`${jobId}-`, "");

          const jobData = JSON.stringify({
            id: jobId,
            url: blob.url,
            userId: userId,
            filename: filename,
          });

          await redis.hSet(`${PREFIX}:job_status:${jobId}`, {
            status: "pending",
          });
          await redis.lPush(`${PREFIX}:job_queue`, jobData);

          console.log(`[Upload Webhook] Successfully queued job: ${jobId}`);
        } catch (error) {
          console.error("[Upload Webhook] error:", error);
          throw error;
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Upload handling error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
}

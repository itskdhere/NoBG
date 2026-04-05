import { headers } from "next/headers";
import { UploadThingError } from "uploadthing/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
import { auth } from "./auth";
import { redis, PREFIX } from "./redis";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 10,
    },
  })
    .input(z.object({ jobId: z.string() }))
    .middleware(async ({ req, input }) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) throw new UploadThingError("Unauthorized");

      await redis.hSet(`${PREFIX}:job_status:${input.jobId}`, {
        status: "uploading",
        userId: session.user.id,
      });

      return { userId: session.user.id, jobId: input.jobId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const { userId, jobId } = metadata;

        const filename = file.name;

        const jobData = JSON.stringify({
          id: jobId,
          url: file.ufsUrl,
          userId: userId,
          filename: filename,
        });

        await redis.hSet(`${PREFIX}:job_status:${jobId}`, {
          status: "pending",
        });
        await redis.lPush(`${PREFIX}:job_queue`, jobData);

        console.log(`[Upload Webhook] Successfully queued job: ${jobId}`);
        return { uploadedBy: userId, jobId };
      } catch (error) {
        console.error("[Upload Webhook] error:", error);
        throw error;
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

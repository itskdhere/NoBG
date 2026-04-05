"use client";

import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useUploadThing } from "@/lib/uploadthing-client";
import { AnimatedThemeToggler } from "@workspace/ui/components/animated-theme-toggler";
import { AvatarDropdown } from "@/components/AvatarDropdown";
import { Button } from "@workspace/ui/components/button";
import FileSelector from "@/components/FileSelector";
import {
  CloudUpload,
  Ellipsis,
  LoaderPinwheel,
  Download,
  OctagonAlert,
  RefreshCcwDot,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export type State = "idle" | "processing" | "done" | "error";

export type UploadServerData = {
  jobId: string;
  sourceUrl: string;
};

export default function App() {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [processingState, setProcessingState] = useState<
    "uploading" | "queued" | "removing-bg" | null
  >(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const filesList = useRef<File[]>([]);
  const jobMap = useRef<Record<string, string>>({});

  const { startUpload } = useUploadThing("imageUploader", {
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    uploadProgressGranularity: "coarse",
  });

  const [processedImages, setProcessedImages] = useState<
    { src: string; originalName: string }[]
  >([]);

  const { data: session, isPending } = authClient.useSession();

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const jobId = crypto.randomUUID();
          const res = await startUpload([file], { jobId });
          if (!res || !res[0]) throw new Error("Upload failed");

          jobMap.current[jobId] = file.name;
          return { jobId, url: res[0].ufsUrl };
        })
      );

      setUploadProgress(100);
      const jobIds = results.map((r) => r.jobId);

      setProcessingState("queued");
      startPollingMultipleJobs(jobIds);
    } catch (error) {
      console.error("Upload error:", error);
      setState("error");
    } finally {
      setIsUploading(false);
    }
  };

  const startPollingMultipleJobs = (initialJobIds: string[]) => {
    let pendingJobIds = [...initialJobIds];
    setProcessingState("queued");

    const interval = setInterval(async () => {
      try {
        const checks = pendingJobIds.map(async (id) => {
          try {
            const res = await axios.get(`/api/status?jobId=${id}`);
            return { id, ...res.data };
          } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
              return { id, status: "pending" };
            }
            throw error;
          }
        });

        const results = await Promise.all(checks);

        const finished = results.filter((job) => job.status === "completed");
        const failed = results.filter((job) => job.status === "failed");
        const processing = results.filter((job) => job.status === "processing");

        if (failed.length > 0) {
          clearInterval(interval);
          setState("error");
          return;
        }

        const pending = results.filter((job) => job.status === "pending");

        if (processing.length > 0) {
          setProcessingState("removing-bg");
        } else if (pending.length > 0) {
          setProcessingState("queued");
        }

        if (finished.length > 0) {
          setProcessedImages((prev) => [
            ...prev,
            ...finished.map((f) => ({
              src: f.result_url,
              originalName: jobMap.current[f.id] || "image.png",
            })),
          ]);

          const finishedIds = finished.map((f) => f.id);
          pendingJobIds = pendingJobIds.filter(
            (id) => !finishedIds.includes(id)
          );
        }

        if (pendingJobIds.length === 0) {
          clearInterval(interval);
          setState("done");
        }
      } catch (error) {
        console.error("Polling error:", error);
        clearInterval(interval);
        setState("error");
      }
    }, 2000);
  };

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (isUploading) {
      setProcessingState("uploading");
    }
  }, [isUploading]);

  useEffect(() => {
    if (state === "processing" && !isUploading && processingState === null) {
      const processFiles = async () => {
        try {
          await uploadFiles(filesList.current);
        } catch (error) {
          console.error(error);
          setState("error");
        }
      };

      processFiles();
    }
  }, [state, isUploading, processingState]);

  useEffect(() => {
    return () => {
      filesList.current.forEach((file) => {
        URL.revokeObjectURL(URL.createObjectURL(file));
      });
    };
  }, []);

  if (!session) {
    return null;
  }

  return (
    <>
      <header className="absolute w-full px-6 md:px-10 py-2 md:py-4">
        <div className="flex justify-center items-center w-full">
          <div className="flex justify-between items-center w-full max-w-4xl">
            <Link
              href="#"
              className="flex justify-between items-center gap-2 hover:opacity-90"
            >
              <Image src="/logo.png" alt="NoBG" width={28} height={28} />
              <h1 className="text-2xl font-bold">NoBG</h1>
            </Link>

            <div className="flex justify-center items-center gap-6">
              <AnimatedThemeToggler className="hover:cursor-pointer" />
              <AvatarDropdown session={session} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col justify-center items-center min-h-screen w-full px-6 md:px-10 py-4 md:py-6 pt-20 md:pt-24">
        <section className="flex flex-col justify-center items-center w-full min-h-100">
          {state === "idle" && (
            <div className="flex flex-col items-center gap-6 w-full">
              <p className="text-lg font-medium">
                Add image(s) by clicking the area below or dragging and dropping
                to get started.
              </p>
              <FileSelector
                filesList={filesList}
                setState={setState}
                className="w-full max-w-lg"
              />
            </div>
          )}

          {state === "processing" && (
            <div className="flex flex-col items-center gap-4">
              {processingState === "uploading" && (
                <CloudUpload className="size-10 animate-bounce text-gray-800 dark:text-gray-200" />
              )}
              {processingState === "queued" && (
                <Ellipsis className="size-10 animate-pulse text-gray-800 dark:text-gray-200" />
              )}
              {processingState === "removing-bg" && (
                <LoaderPinwheel className="size-10 animate-spin text-gray-800 dark:text-gray-200" />
              )}
              <p className="text-lg font-medium">
                {processingState === "uploading" &&
                  `Uploading... ${uploadProgress}%`}
                {processingState === "queued" && "Queued for processing..."}
                {processingState === "removing-bg" && "Removing background..."}
              </p>
            </div>
          )}

          {state === "done" && (
            <div className="flex flex-col items-center gap-6 w-full">
              <p className="text-lg font-medium">Done! Download your images.</p>
              <Button
                variant="secondary"
                className="hover:cursor-pointer"
                onClick={() => {
                  setProcessedImages([]);
                  setProcessingState(null);
                  setState("idle");
                }}
              >
                <RefreshCcwDot size={18} />
                Start Over
              </Button>
              <div
                className={cn(
                  "grid gap-4 mt-4",
                  processedImages.length === 1
                    ? "grid-cols-1"
                    : "grid-cols-1 md:grid-cols-2"
                )}
              >
                {processedImages.map(({ src, originalName }, index) => (
                  <div
                    key={index}
                    className="flex flex-col justify-between items-center gap-4 border rounded-lg p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Processed ${index}`}
                      className="h-auto w-full max-w-xs object-contain"
                    />

                    <div className="flex flex-col justify-center items-center w-full">
                      <Button size="default" variant="default" asChild>
                        <a
                          href={src}
                          download={`${originalName.replace(
                            /\.[^/.]+$/,
                            ""
                          )}-nobg.png`}
                        >
                          <Download size={18} />
                          <span>Download</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center gap-4">
              <OctagonAlert className="size-10 text-red-600" />
              <p className="text-lg font-medium">
                Oops! Something went wrong. Please try again.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setProcessingState(null);
                  setState("idle");
                }}
              >
                Try Again
              </Button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

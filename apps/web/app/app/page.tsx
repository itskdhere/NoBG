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
  IconCloudUpload,
  IconDots,
  IconLoader,
  IconCloudDownload,
  IconAlertOctagon,
  IconRefreshDot,
  IconTrash,
  IconHistory,
  IconPhoto,
} from "@tabler/icons-react";
import { cn } from "@workspace/ui/lib/utils";

export type State = "idle" | "processing" | "done" | "error";

export type UploadServerData = {
  jobId: string;
  sourceUrl: string;
};

export type HistoryItem = {
  id: string;
  originalName: string;
  sourceUrl: string;
  resultUrl: string;
  createdAt: string;
};

export default function App() {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [processingState, setProcessingState] = useState<
    "uploading" | "queued" | "removing-bg" | null
  >(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const filesListRef = useRef<File[]>([]);
  const jobMap = useRef<Record<string, string>>({});
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const { startUpload } = useUploadThing("imageUploader", {
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    uploadProgressGranularity: "coarse",
  });

  const [processedImages, setProcessedImages] = useState<
    { src: string; originalName: string }[]
  >([]);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showOriginalMap, setShowOriginalMap] = useState<
    Record<string, boolean>
  >({});

  const { data: session, isPending } = authClient.useSession();

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await axios.get("/api/history");
      setHistory(res.data.images || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await axios.delete(`/api/history?id=${id}`);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete history item:", error);
    }
  };

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
          setProcessedImages((prev) => {
            const existingSrcs = new Set(prev.map((p) => p.src));
            const newImages = finished
              .filter((f) => !existingSrcs.has(f.result_url))
              .map((f) => ({
                src: f.result_url,
                originalName: jobMap.current[f.id] || "image.png",
              }));
            return [...prev, ...newImages];
          });

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
    pollingIntervalRef.current = interval;
  };

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session) {
      fetchHistory();
    }
  }, [session]);

  useEffect(() => {
    if (state === "done") {
      fetchHistory();
    }
  }, [state]);

  useEffect(() => {
    if (isUploading) {
      setProcessingState("uploading");
    }
  }, [isUploading]);

  useEffect(() => {
    if (state === "processing" && !isUploading && processingState === null) {
      const processFiles = async () => {
        try {
          await uploadFiles(filesListRef.current);
        } catch (error) {
          console.error(error);
          setState("error");
        }
      };

      processFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, isUploading, processingState]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
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
                filesListRef={filesListRef}
                setState={setState}
                className="w-full max-w-lg"
              />
            </div>
          )}

          {state === "processing" && (
            <div className="flex flex-col items-center gap-4">
              {processingState === "uploading" && (
                <IconCloudUpload className="size-10 animate-bounce text-gray-800 dark:text-gray-200" />
              )}
              {processingState === "queued" && (
                <IconDots className="size-10 animate-pulse text-gray-800 dark:text-gray-200" />
              )}
              {processingState === "removing-bg" && (
                <IconLoader className="size-10 animate-spin text-gray-800 dark:text-gray-200" />
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
                <IconRefreshDot size={18} />
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
                {processedImages.map(({ src, originalName }) => (
                  <div
                    key={src}
                    className="flex flex-col justify-between items-center gap-4 border rounded-lg p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={originalName}
                      className="h-auto w-full max-w-xs object-contain"
                    />

                    <div className="flex flex-col justify-center items-center w-full">
                      <Button
                        size="default"
                        variant="default"
                        className="cursor-pointer"
                        onClick={async () => {
                          try {
                            const response = await fetch(src);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = `${originalName.replace(
                              /\.[^/.]+$/,
                              ""
                            )}-nobg.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error("Failed to download image", error);
                            window.open(src, "_blank");
                          }
                        }}
                      >
                        <IconCloudDownload size={18} />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center gap-4">
              <IconAlertOctagon className="size-10 text-red-600" />
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

        <section className="flex flex-col items-center w-full max-w-4xl py-12 border-t mt-12">
          <div className="flex items-center justify-between w-full mb-8">
            <div className="flex items-center gap-1.5">
              <IconHistory className="size-5 text-primary" />
              <h2 className="text-xl">Previously Removed Photos</h2>
            </div>
            {history.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {history.length} {history.length === 1 ? "photo" : "photos"}{" "}
                saved
              </span>
            )}
          </div>

          {isLoadingHistory && history.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <IconLoader className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl w-full text-center text-muted-foreground">
              <IconHistory className="size-10 mb-2 opacity-50" />
              <p className="font-medium">No previously removed photos yet.</p>
              <p className="text-sm mt-1">
                Upload photos above to remove backgrounds and view your history
                here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {history.map((item) => {
                const isShowingOriginal = showOriginalMap[item.id] ?? false;
                const displaySrc =
                  isShowingOriginal && item.sourceUrl
                    ? item.sourceUrl
                    : item.resultUrl;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-shadow relative group"
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden border bg-accent/20 flex items-center justify-center mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={displaySrc}
                        alt={item.originalName}
                        className="h-full w-full object-contain p-2"
                      />

                      {item.sourceUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowOriginalMap((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }))
                          }
                          className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-background/80 backdrop-blur text-xs font-medium border shadow hover:bg-background transition-colors flex items-center gap-1 cursor-pointer"
                          title="Toggle original vs background removed"
                        >
                          <IconPhoto size={14} />
                          <span>{isShowingOriginal ? "Original" : "NoBG"}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className="text-sm font-medium truncate"
                          title={item.originalName}
                        >
                          {item.originalName}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 cursor-pointer text-xs"
                          onClick={async () => {
                            try {
                              const response = await fetch(item.resultUrl);
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `${item.originalName.replace(
                                /\.[^/.]+$/,
                                ""
                              )}-nobg.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } catch (error) {
                              console.error("Failed to download image", error);
                              window.open(item.resultUrl, "_blank");
                            }
                          }}
                        >
                          <IconCloudDownload size={16} />
                          <span>Download</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer px-2"
                          title="Delete from history"
                          onClick={() => handleDeleteHistory(item.id)}
                        >
                          <IconTrash size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

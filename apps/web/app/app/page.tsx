"use client";

import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AnimatedThemeToggler } from "@workspace/ui/components/animated-theme-toggler";
import { AvatarDropdown } from "@/components/AvatarDropdown";
import { Button } from "@workspace/ui/components/button";
import FileSelector from "@/components/FileSelector";
import {
  LoaderPinwheel,
  OctagonAlert,
  RefreshCcwDot,
  Download,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export type State = "idle" | "processing" | "done" | "error";

export default function App() {
  const router = useRouter();

  const [state, setState] = useState<State>("idle");
  const filesList = useRef<File[]>([]);
  const [processedImages, setProcessedImages] = useState<
    { src: string; originalName: string }[]
  >([]);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [isPending, session]);

  useEffect(() => {
    if (state === "processing") {
      const processFiles = async () => {
        try {
          const promises = filesList.current.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            const apiUrl =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await axios.post(`${apiUrl}/remove-bg`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
              responseType: "blob",
            });
            return {
              src: URL.createObjectURL(response.data),
              originalName: file.name,
            };
          });
          const results = await Promise.all(promises);
          setProcessedImages(results);
          setState("done");
        } catch (error) {
          console.error(error);
          setState("error");
        }
      };

      processFiles();
    }
  }, [state]);

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

      <main className="flex flex-col justify-center items-center min-h-screen w-full px-6 md:px-10 py-4 md:py-6">
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
              <LoaderPinwheel className="size-10 animate-spin text-gray-800 dark:text-gray-200" />
              <p className="text-lg font-medium">Processing...</p>
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
            </div>
          )}
        </section>
      </main>
    </>
  );
}

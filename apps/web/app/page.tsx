"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import FileSelector from "@/components/FileSelector";
import { AnimatedThemeToggler } from "@workspace/ui/components/animated-theme-toggler";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Github,
  LoaderPinwheel,
  OctagonAlert,
  RefreshCcwDot,
  Download,
} from "lucide-react";

export type State = "idle" | "processing" | "done" | "error";

export default function Page() {
  const [state, setState] = useState<State>("idle");
  const filesList = useRef<File[]>([]);
  const [processedImages, setProcessedImages] = useState<
    { src: string; originalName: string }[]
  >([]);

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

  return (
    <>
      <header className="flex justify-center items-center px-6 md:px-10 py-4 md:py-6">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-2xl font-bold">
            <Link href="/" className="hover:opacity-90">
              NoBG
            </Link>
          </h1>
          <div className="flex justify-center items-center gap-6">
            <Badge asChild variant="outline" className="p-3">
              <Link
                href="https://github.com/itskdhere/NoBG"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={20} className="size-20" />
                <span className="text-xs">itskdhere/NoBG</span>
              </Link>
            </Badge>
            <AnimatedThemeToggler className="hover:cursor-pointer" />
          </div>
        </div>
      </header>

      <main className="flex flex-col justify-center items-center px-6 md:px-10 py-4 md:py-6">
        <section className="flex flex-col justify-center items-center w-full max-w-3xl pt-6">
          <h2 className="text-xl font-semibold mb-2">Backgrounds, Gone.</h2>
          <p className="text-center text-gray-600 dark:text-gray-400">
            The simplest way to isolate your subject. 100% automatic, 100% free.
          </p>
        </section>

        <section className="flex flex-col justify-center items-center w-full min-h-100">
          {state === "idle" && (
            <FileSelector
              filesList={filesList}
              setState={setState}
              className="w-full max-w-lg"
            />
          )}

          {state === "processing" && (
            <div className="mt-10 flex flex-col items-center gap-4">
              <LoaderPinwheel className="size-10 animate-spin text-gray-800 dark:text-gray-200" />
              <p className="text-lg font-medium">Processing...</p>
            </div>
          )}

          {state === "done" && (
            <div className="flex flex-col items-center gap-6 mt-10 w-full">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                {processedImages.map(({ src, originalName }, index) => (
                  <div
                    key={index}
                    className="flex flex-col justify-between items-center gap-4 border rounded-lg p-2"
                  >
                    <img
                      src={src}
                      alt={`Processed ${index}`}
                      className="w-full h-auto object-contain"
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
            <div className="mt-10 flex flex-col items-center gap-4">
              <OctagonAlert className="size-10 text-red-600" />
              <p className="text-lg font-medium">
                Oops! Something went wrong. Please try again.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="flex justify-center items-center gap-2 px-6 md:px-10 py-4 md:py-6 max-h-20 w-full text-sm text-gray-600 dark:text-gray-400">
        <p>
          Developed & Maintained by{" "}
          <Link
            href="https://itskdhere.com"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            KD
          </Link>
        </p>
      </footer>
    </>
  );
}

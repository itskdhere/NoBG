"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { IconCloudDownload, IconLoader } from "@tabler/icons-react";
import { cn } from "@workspace/ui/lib/utils";

export default function ProcessedImageCard({
  src,
  originalName,
}: {
  src: string;
  originalName: string;
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const isLoading = loadedSrc !== src;

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth !== 0) {
      setTimeout(() => setLoadedSrc(src), 0);
    }
  }, [src]);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${originalName.replace(/\.[^/.]+$/, "")}-nobg.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image", error);
      window.open(src, "_blank");
    }
  };

  return (
    <div className="flex flex-col justify-between border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-shadow relative group w-full max-w-xs">
      <div className="relative aspect-square w-full rounded-lg overflow-hidden border bg-accent/20 flex items-center justify-center mb-3">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-xs z-10">
            <IconLoader className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={originalName}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setLoadedSrc(src)}
          className={cn(
            "h-full w-full object-contain p-2 transition-opacity duration-200",
            isLoading ? "opacity-0" : "opacity-100"
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p
            className="text-sm font-medium truncate align-middle text-center w-full"
            title={originalName}
          >
            {originalName}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2 w-full">
          <Button
            size="sm"
            variant="default"
            className="flex-1 cursor-pointer text-xs"
            onClick={handleDownload}
          >
            <IconCloudDownload size={16} />
            <span>Download</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

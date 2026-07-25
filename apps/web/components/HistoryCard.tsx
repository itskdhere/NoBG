"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  IconCloudDownload,
  IconLoader,
  IconPhoto,
  IconTrash,
} from "@tabler/icons-react";
import { cn } from "@workspace/ui/lib/utils";
import type { HistoryItem } from "@/app/app/page";

export function HistoryCard({
  item,
  isShowingOriginal,
  onToggleOriginal,
  onDeleteHistory,
}: {
  item: HistoryItem;
  isShowingOriginal: boolean;
  onToggleOriginal: () => void;
  onDeleteHistory: (id: string) => void;
}) {
  const displaySrc =
    isShowingOriginal && item.sourceUrl ? item.sourceUrl : item.resultUrl;

  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const isLoading = loadedSrc !== displaySrc;

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth !== 0) {
      setLoadedSrc(displaySrc);
    }
  }, [displaySrc]);

  return (
    <div className="flex flex-col justify-between border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-shadow relative group">
      <div className="relative aspect-square w-full rounded-lg overflow-hidden border bg-accent/20 flex items-center justify-center mb-3">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-xs z-10">
            <IconLoader className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={displaySrc}
          alt={item.originalName}
          onLoad={() => setLoadedSrc(displaySrc)}
          onError={() => setLoadedSrc(displaySrc)}
          className={cn(
            "h-full w-full object-contain p-2 transition-opacity duration-200",
            isLoading ? "opacity-0" : "opacity-100"
          )}
        />

        {item.sourceUrl && (
          <button
            type="button"
            disabled={isLoading}
            onClick={onToggleOriginal}
            className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-background/80 backdrop-blur text-xs font-medium border shadow hover:bg-background transition-colors flex items-center gap-1 cursor-pointer z-20 disabled:opacity-75 disabled:cursor-not-allowed"
            title="Toggle original vs background removed"
          >
            {isLoading ? (
              <IconLoader className="size-3.5 animate-spin" />
            ) : (
              <IconPhoto size={14} />
            )}
            <span>{isShowingOriginal ? "Original" : "NoBG"}</span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate" title={item.originalName}>
            {item.originalName}
          </p>
          <span className="text-xs text-muted-foreground shrink-0">
            {new Date(item.createdAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
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
            onClick={() => onDeleteHistory(item.id)}
          >
            <IconTrash size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

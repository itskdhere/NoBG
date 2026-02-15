"use client";

import { useEffect } from "react";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
  CircleAlert,
  ImagePlus,
  Trash2,
  ArrowRight,
  Image,
} from "lucide-react";
import { State } from "@/app/app/page";

export default function FileSelector({
  className,
  filesList,
  setState,
}: {
  className?: string;
  filesList: {
    current: File[];
  };
  setState: (value: State) => void;
}) {
  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: true,
    accept: "image/*",
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10 MB
  });

  useEffect(() => {
    filesList.current = files.map((f) =>
      f.file instanceof File ? f.file : new File([], f.file.name)
    );
  }, [files, filesList]);

  const handleContinue = () => {
    setState("processing");
  };

  return (
    <div className={cn("flex flex-col gap-2 p-5 border rounded-xl", className)}>
      {/* Drop area */}
      <div
        role="button"
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-input p-4 transition-colors hover:cursor-cell hover:bg-accent/50 has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Add images"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div
            className="mb-2 flex size-12 shrink-0 items-center justify-center rounded-full border bg-background"
            aria-hidden="true"
          >
            <ImagePlus className="size-6 opacity-60" />
          </div>
          <p className="mb-1.5 text-lg font-medium">Add Image(s)</p>
          <p className="mb-2 text-muted-foreground">
            Drag & Drop / Click to browse images
          </p>
          <div className="flex flex-wrap justify-center gap-1 text-sm text-muted-foreground/70">
            <span>Max 10 files</span>
            <span> • </span>
            <span>Upto 10MB each</span>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div
          className="flex items-center gap-1 text-xs text-destructive"
          role="alert"
        >
          <CircleAlert className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-2 rounded-lg border p-2 pe-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex aspect-square size-12 shrink-0 items-center justify-center rounded border">
                  {file.file instanceof File ? (
                    <img
                      src={URL.createObjectURL(file.file)}
                      alt={file.file.name}
                      className="h-full w-full rounded object-cover"
                    />
                  ) : (
                    <Image className="size-5 opacity-70" aria-hidden="true" />
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-sm font-medium">
                    {file.file instanceof File
                      ? file.file.name
                      : file.file.name}
                  </p>
                  <div className="flex flex-wrap justify-start gap-1 text-xs text-muted-foreground">
                    <span>
                      {formatBytes(
                        file.file instanceof File
                          ? file.file.size
                          : file.file.size
                      )}
                    </span>
                    <span> • </span>
                    <span>
                      {file.file instanceof File
                        ? new Date(file.file.lastModified).toDateString()
                        : "Unknown Date"}
                    </span>
                    <span> • </span>
                    <span>
                      {file.file instanceof File
                        ? new Date(file.file.lastModified).toTimeString()
                        : "Unknown Time"}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground hover:cursor-pointer"
                onClick={() => removeFile(file.id)}
                aria-label="Remove file"
              >
                <Trash2 className="size-4 text-red-400" aria-hidden="true" />
              </Button>
            </div>
          ))}

          {/* Action buttons */}
          {files.length > 0 && (
            <div className="flex justify-between items-center mt-5">
              <Button
                size="sm"
                variant="secondary"
                className="leading-tight hover:cursor-pointer"
                onClick={clearFiles}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                <span>Remove All</span>
              </Button>

              <Button
                size="sm"
                variant="default"
                className="leading-tight hover:cursor-pointer"
                onClick={handleContinue}
              >
                <span>Continue</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

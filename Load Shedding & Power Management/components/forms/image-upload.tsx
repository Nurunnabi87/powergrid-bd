"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/validations/common";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: File | null | undefined;
  onChange: (file: File | null) => void;
  /** 0–100 while uploading; null when idle. */
  progress?: number | null;
  invalid?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
  "aria-describedby"?: string;
}

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

/**
 * Image picker with drag-and-drop, a local preview and an upload progress
 * bar. Validation (type/size) is done by the form's Zod schema.
 */
export function ImageUpload({
  value,
  onChange,
  progress = null,
  invalid = false,
  disabled = false,
  label = "Add a photo",
  className,
  ...aria
}: ImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // The preview URL is derived from the file; the effect only frees it.
  // Object URLs must be revoked, or every preview leaks memory.
  const previewUrl = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const pick = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onChange(file);
  };

  if (value && previewUrl) {
    return (
      <div className={cn("space-y-3 rounded-xl border p-3", invalid && "border-destructive", className)}>
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          {/* Local blob preview: next/image cannot optimise object URLs, so it is served as-is. */}
          <Image src={previewUrl} alt="Selected photo preview" fill unoptimized className="object-contain" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium">{value.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(value.size)}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} disabled={disabled || progress !== null}>
            <Trash2 /> Remove
          </Button>
        </div>
        {progress !== null && (
          <div className="space-y-1" role="status" aria-live="polite">
            <Progress value={progress} aria-label="Upload progress" />
            <p className="text-xs text-muted-foreground">{progress < 100 ? `Uploading… ${progress}%` : "Processing…"}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        pick(event.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors hover:bg-muted/50",
        dragging && "border-primary bg-primary/5",
        invalid && "border-destructive",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-[color-mix(in_oklch,var(--primary),black_35%)] dark:text-primary">
        <ImagePlus className="size-6" aria-hidden />
      </span>
      <span className="font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">
        Drag and drop, or click to browse · JPEG, PNG or WebP up to {MAX_IMAGE_BYTES / 1024 / 1024} MB
      </span>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          pick(event.target.files);
          event.target.value = "";
        }}
        {...aria}
      />
    </label>
  );
}

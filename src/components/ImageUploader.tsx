"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const ACCEPTED = [
  ".jpg", ".jpeg", ".png", ".webp", ".gif",
  ".heic", ".heif",   // iPhone
  ".avif",            // Pixel / modern Android
  ".tiff", ".bmp",
].join(",");

export default function ImageUploader({
  images,
  onChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        setError(`Maximum ${maxImages} images allowed.`);
        return;
      }
      const toUpload = files.slice(0, remaining);
      setUploading(true);
      setError("");

      const uploaded: string[] = [];
      for (const file of toUpload) {
        try {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Upload failed");
          }
          const { url } = await res.json();
          uploaded.push(url);
        } catch (e) {
          setError(`Failed to upload ${file.name}: ${e instanceof Error ? e.message : "unknown error"}`);
        }
      }

      onChange([...images, ...uploaded]);
      setUploading(false);
    },
    [images, onChange, maxImages]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    uploadFiles(files);
    // reset so the same file can be re-selected if needed
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    uploadFiles(files);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const canAddMore = images.length < maxImages && !uploading;

  return (
    <div className="space-y-3">
      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group w-20 h-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Upload ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border border-stone-200"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {/* Inline add button when images exist */}
          {canAddMore && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-20 h-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 hover:border-brand-400 text-stone-400 hover:text-brand-500 transition-colors text-xs gap-1"
            >
              <ImageIcon className="w-5 h-5" />
              Add
            </button>
          )}
        </div>
      )}

      {/* Drop zone — only shown when no images yet */}
      {images.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => canAddMore && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
            dragOver
              ? "border-brand-400 bg-brand-50"
              : "border-stone-300 hover:border-brand-400 bg-stone-50"
          }`}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-stone-400" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-stone-700">
              {uploading ? "Uploading…" : "Drop images here or click to browse"}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              JPEG, PNG, WebP, HEIC (iPhone), AVIF (Pixel) · up to {maxImages} images
            </p>
          </div>
        </div>
      )}

      {/* Uploading indicator when images already present */}
      {images.length > 0 && uploading && (
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Uploading…
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

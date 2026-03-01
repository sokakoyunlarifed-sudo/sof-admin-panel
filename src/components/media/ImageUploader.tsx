"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
export function ImageUploader({
  onUploaded,
  folder,
  initialUrl,
}: {
  onUploaded: (url: string, path: string) => void;
  folder: string; // e.g., "news" | "projects" | "events"
  initialUrl?: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Yükleme başarısız");
      const data = await res.json();
      setUrl(data.url);
      onUploaded(data.url, data.url);
    } catch (e) {
      console.error(e);
      alert("Yükleme başarısız");
    } finally {
      setUploading(false);
    }
  }, [folder, onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "image/*": [] },
  });

  return (
    <div className="space-y-2">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Yüklendi" className="h-32 w-32 rounded object-cover" />
      )}
      <div
        {...getRootProps()}
        className="flex h-32 cursor-pointer items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-600 hover:bg-gray-50 dark:border-dark-3 dark:text-dark-6"
      >
        <input {...getInputProps()} />
        {uploading ? "Yükleniyor..." : isDragActive ? "Görseli buraya bırakın" : "Sürükleyip bırakın veya yüklemek için tıklayın"}
      </div>
    </div>
  );
} 
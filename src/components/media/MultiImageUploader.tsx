"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export function MultiImageUploader({
  folder,
  initialUrls,
  onChange,
}: {
  folder: string; // e.g., "news"
  initialUrls?: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [urls, setUrls] = useState<string[]>(() => initialUrls?.filter(Boolean) ?? []);
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      setUploading(true);
      try {
        const uploaded: string[] = [];
        for (const file of acceptedFiles) {
          const ext = file.name.split(".").pop() || "png";
          const random = Math.random().toString(36).slice(2, 8);
          const timestamp = Date.now();
          const path = `${folder}/${timestamp}-${random}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("mediaa")
            .upload(path, file, { cacheControl: "3600", upsert: false });
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from("mediaa").getPublicUrl(path);
          uploaded.push(data.publicUrl);
        }
        const next = [...urls, ...uploaded];
        setUrls(next);
        onChange(next);
      } catch (e) {
        console.error(e);
        alert("Yükleme başarısız");
      } finally {
        setUploading(false);
      }
    },
    [folder, supabase, urls, onChange]
  );

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...urls];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setUrls(next);
    onChange(next);
  };

  const remove = (idx: number) => {
    const next = urls.filter((_, i) => i !== idx);
    setUrls(next);
    onChange(next);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: { "image/*": [] },
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {urls.map((u, idx) => (
          <div key={`${u}-${idx}`} className="relative rounded border p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="yüklendi" className="h-24 w-full rounded object-cover" />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded border hover:bg-gray-50" onClick={() => move(idx, -1)} aria-label="Sola taşı">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded border hover:bg-gray-50" onClick={() => move(idx, 1)} aria-label="Sağa taşı">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded border hover:bg-red-50" onClick={() => remove(idx)} aria-label="Kaldır">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div
        {...getRootProps()}
        className="flex h-32 cursor-pointer items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-600 hover:bg-gray-50 dark:border-dark-3 dark:text-dark-6"
      >
        <input {...getInputProps()} />
        {uploading ? "Yükleniyor..." : isDragActive ? "Görselleri buraya bırakın" : "Birden fazla görseli yüklemek için sürükleyip bırakın veya tıklayın"}
      </div>
    </div>
  );
} 
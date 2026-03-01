"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/media/ImageUploader";
import { MultiImageUploader } from "@/components/media/MultiImageUploader";
import { buttonVariants } from "@/components/ui-elements/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export type NewsDraft = {
  title: string;
  date: string | null;
  short_text: string | null;
  full_text: string | null;
  image: string | null;
  video_url: string | null;
  images: string[];
};

function toLocalDateValue(d?: string | null) {
  if (!d) return "";
  const date = new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function NewsFormClient({ initial, mode, id }: { initial?: Partial<NewsDraft> & { created_at?: string | null }; mode: "new" | "edit"; id?: string }) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<NewsDraft>({
    title: initial?.title || "",
    date: initial?.date || null,
    short_text: initial?.short_text || null,
    full_text: initial?.full_text || null,
    image: initial?.image || null,
    video_url: initial?.video_url || null,
    images: initial?.images || [],
  });

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const url = mode === "new" ? "/api/news" : `/api/news/${id}`;
      const method = mode === "new" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kaydetme başarısız");
      }

      router.replace("/content/news");
      router.refresh(); // force refresh lists
    } catch (err: any) {
      setError(err?.message || "Kaydetme başarısız");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm("Bu haberi silmek istiyor musunuz? Bu işlem geri alınamaz.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silme başarısız");
      router.replace("/content/news");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Silme başarısız");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{mode === "new" ? "Yeni Haber" : "Haberi Düzenle"}</h1>
        <div className="flex gap-2">
          {mode === "edit" && (
            <button className={cn(buttonVariants({ variant: "outlineDark", shape: "rounded", size: "small" }))} onClick={handleDelete} disabled={saving}>
              Sil
            </button>
          )}
          <button className={cn(buttonVariants({ variant: "primary", shape: "rounded", size: "small" }))} onClick={handleSave} disabled={saving}>
            Kaydet
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded border p-4 dark:border-dark-3 space-y-3">
            <label className="block text-sm">Başlık</label>
            <input className="w-full rounded border p-2" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />

            <label className="block text-sm">Tarih</label>
            <input
              type="date"
              className="w-full rounded border p-2"
              value={toLocalDateValue(draft.date)}
              onChange={(e) => setDraft({ ...draft, date: e.target.value || null })}
            />

            <label className="block text-sm">YouTube Video URL (Opsiyonel)</label>
            <input
              className="w-full rounded border p-2"
              placeholder="Örn: https://www.youtube.com/watch?v=..."
              value={draft.video_url || ""}
              onChange={(e) => setDraft({ ...draft, video_url: e.target.value || null })}
            />

            <label className="block text-sm">Kısa Metin</label>
            <textarea className="w-full rounded border p-2" value={draft.short_text || ""} onChange={(e) => setDraft({ ...draft, short_text: e.target.value || null })} />

            <label className="block text-sm">Tam Metin</label>
            <textarea className="min-h-40 w-full rounded border p-2" value={draft.full_text || ""} onChange={(e) => setDraft({ ...draft, full_text: e.target.value || null })} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded border p-4 dark:border-dark-3">
            <h2 className="mb-2 font-medium">Kapak Görseli</h2>
            <ImageUploader
              folder="news"
              initialUrl={draft.image}
              onUploaded={(url) => setDraft({ ...draft, image: url })}
            />
          </div>

          <div className="rounded border p-4 dark:border-dark-3">
            <h2 className="mb-2 font-medium">Diğer Görseller (Çoklu Yükleme)</h2>
            <MultiImageUploader
              folder="news"
              initialUrls={draft.images}
              onChange={(urls: string[]) => setDraft({ ...draft, images: urls })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
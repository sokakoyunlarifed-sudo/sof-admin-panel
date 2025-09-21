"use client";

import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ImageUploader } from "@/components/media/ImageUploader";
import { buttonVariants } from "@/components/ui-elements/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export type NewsDraft = {
  title: string;
  date: string | null;
  short_text: string | null;
  full_text: string | null;
  image: string | null;
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
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<NewsDraft>({
    title: initial?.title || "",
    date: initial?.date || null,
    short_text: initial?.short_text || null,
    full_text: initial?.full_text || null,
    image: initial?.image || null,
  });

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (mode === "new") {
        const { error: e } = await supabase.from("news").insert({
          title: draft.title,
          date: draft.date,
          short_text: draft.short_text,
          full_text: draft.full_text,
          image: draft.image,
        });
        if (e) throw e;
      } else if (mode === "edit" && id) {
        const { error: e } = await supabase
          .from("news")
          .update({
            title: draft.title,
            date: draft.date,
            short_text: draft.short_text,
            full_text: draft.full_text,
            image: draft.image,
          })
          .eq("id", id);
        if (e) throw e;
      }
      router.replace("/content/news");
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
      await supabase.from("news").delete().eq("id", id);
      router.replace("/content/news");
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
        </div>
      </div>
    </div>
  );
} 
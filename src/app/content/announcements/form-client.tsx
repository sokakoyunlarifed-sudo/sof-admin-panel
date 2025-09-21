"use client";

import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { buttonVariants } from "@/components/ui-elements/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/media/ImageUploader";

export type AnnouncementDraft = {
  title: string;
  date: string | null;
  location: string | null;
  description: string | null;
  image: string | null;
};

export default function AnnouncementFormClient({ initial, mode, id }: { initial?: Partial<AnnouncementDraft>; mode: "new" | "edit"; id?: string }) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<AnnouncementDraft>({
    title: initial?.title || "",
    date: initial?.date || null,
    location: initial?.location || null,
    description: initial?.description || null,
    image: initial?.image || null,
  });

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (mode === "new") {
        const { error: e } = await supabase.from("announcements").insert({
          title: draft.title,
          date: draft.date,
          location: draft.location,
          description: draft.description,
          image: draft.image,
        });
        if (e) throw e;
      } else if (mode === "edit" && id) {
        const { error: e } = await supabase
          .from("announcements")
          .update({
            title: draft.title,
            date: draft.date,
            location: draft.location,
            description: draft.description,
            image: draft.image,
          })
          .eq("id", id);
        if (e) throw e;
      }
      router.replace("/content/announcements");
    } catch (err: any) {
      setError(err?.message || "Kaydetme başarısız");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm("Bu öğeyi silmek istiyor musunuz? Bu işlem geri alınamaz.")) return;
    setSaving(true);
    try {
      await supabase.from("announcements").delete().eq("id", id);
      router.replace("/content/announcements");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{mode === "new" ? "Yeni Duyuru" : "Duyuruyu Düzenle"}</h1>
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
            <input type="date" className="w-full rounded border p-2" value={draft.date || ""} onChange={(e) => setDraft({ ...draft, date: e.target.value || null })} />

            <label className="block text-sm">Yer</label>
            <input className="w-full rounded border p-2" value={draft.location || ""} onChange={(e) => setDraft({ ...draft, location: e.target.value || null })} />

            <label className="block text-sm">Açıklama</label>
            <textarea className="min-h-40 w-full rounded border p-2" value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value || null })} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded border p-4 dark:border-dark-3">
            <h2 className="mb-2 font-medium">Kapak Görseli</h2>
            <ImageUploader folder="announcements" initialUrl={draft.image} onUploaded={(url) => setDraft({ ...draft, image: url })} />
          </div>
        </div>
      </div>
    </div>
  );
} 
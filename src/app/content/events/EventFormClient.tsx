"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageUploader } from "@/components/media/ImageUploader";
import { buttonVariants } from "@/components/ui-elements/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export type EventDraft = {
  title: string;
  description: string;
  location: string;
  event_date: string | null;
  image_url: string | null;
};

function toLocalInputValue(iso?: string | null) {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function EventFormClient({
  initialEn,
  initialAz,
  mode,
  id,
}: {
  initialEn?: Partial<EventDraft> & { published_at?: string | null; created_at?: string | null };
  initialAz?: Partial<EventDraft> & { published_at?: string | null; created_at?: string | null };
  mode: "new" | "edit";
  id?: string;
}) {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"en" | "az">("en");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [en, setEn] = useState<EventDraft>({
    title: initialEn?.title || "",
    description: initialEn?.description || "",
    location: initialEn?.location || "",
    event_date: initialEn?.event_date || null,
    image_url: initialEn?.image_url || null,
  });

  const [az, setAz] = useState<EventDraft>({
    title: initialAz?.title || "",
    description: initialAz?.description || "",
    location: initialAz?.location || en.location || "",
    event_date: initialAz?.event_date || en.event_date || null,
    image_url: initialAz?.image_url || en.image_url || null,
  });

  const [createdAt, setCreatedAt] = useState<string>(toLocalInputValue(initialEn?.created_at || null));
  const [eventDate, setEventDate] = useState<string>(toLocalInputValue(initialEn?.event_date || null));

  useEffect(() => {
    // keep event date across langs
    setAz((s) => ({ ...s, event_date: en.event_date }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [en.event_date]);

  async function audit(action: string, extra?: Record<string, any>) {
    try {
      await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          entity_type: "events",
          entity_id: id || en.title || undefined,
          metadata: {
            mode,
            published: !!(extra?.published ?? false),
            title: en.title || az.title || null,
            event_date: eventDate || null,
            ...extra,
          },
        }),
      });
    } catch {}
  }

  async function handleSave(publish: boolean) {
    setSaving(true);
    setError(null);
    try {
      const published_at = publish ? new Date().toISOString() : null;
      const created_at_iso = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();
      
      const payload = {
        en, az, published_at, created_at_iso
      };

      const url = mode === "new" ? "/api/events" : `/api/events/${id}`;
      const method = mode === "new" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Kaydetme başarısız");

      await audit(publish ? "events_published" : "events_draft", { published: !!published_at });
      router.replace("/content/events");
      router.refresh();
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
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        await audit("events_deleted", {});
        router.replace("/content/events");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{mode === "new" ? "Yeni Etkinlik" : "Etkinliği Düzenle"}</h1>
        <div className="flex gap-2">
          {mode === "edit" && (
            <button
              className={cn(buttonVariants({ variant: "outlineDark", shape: "rounded", size: "small" }))}
              onClick={handleDelete}
              disabled={saving}
            >
              Sil
            </button>
          )}
          <button
            className={cn(buttonVariants({ variant: "outlineDark", shape: "rounded", size: "small" }))}
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            Taslak Olarak Kaydet
          </button>
          <button
            className={cn(buttonVariants({ variant: "primary", shape: "rounded", size: "small" }))}
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            Yayınla
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded border p-4 dark:border-dark-3">
            <div className="mb-4 flex gap-2">
              <button
                className={`rounded px-3 py-1 text-sm ${activeTab === "en" ? "bg-primary text-white" : "border"}`}
                onClick={() => setActiveTab("en")}
              >
                EN
              </button>
              <button
                className={`rounded px-3 py-1 text-sm ${activeTab === "az" ? "bg-primary text-white" : "border"}`}
                onClick={() => setActiveTab("az")}
              >
                AZ
              </button>
            </div>

            {activeTab === "en" ? (
              <LangForm data={en} onChange={setEn} showDate valueDate={eventDate} onChangeDate={setEventDate} />
            ) : (
              <LangForm data={az} onChange={setAz} showDate={false} valueDate={eventDate} onChangeDate={setEventDate} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded border p-4 dark:border-dark-3">
            <h2 className="mb-2 font-medium">Kapak Görseli</h2>
            <ImageUploader
              folder="events"
              initialUrl={activeTab === "en" ? en.image_url : az.image_url}
              onUploaded={(url) => {
                setEn((s) => ({ ...s, image_url: url }));
                setAz((s) => ({ ...s, image_url: url }));
              }}
            />
          </div>

          <div className="rounded border p-4 dark:border-dark-3">
            <h2 className="mb-2 font-medium">Metadata</h2>
            <label className="mb-1 block text-sm">Oluşturulma</label>
            <input
              type="datetime-local"
              className="w-full rounded border p-2"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LangForm({ data, onChange, showDate, valueDate, onChangeDate }: { data: EventDraft; onChange: (d: EventDraft) => void; showDate?: boolean; valueDate: string; onChangeDate: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm">Başlık</label>
      <input className="w-full rounded border p-2" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      <label className="block text-sm">Açıklama</label>
      <textarea className="w-full rounded border p-2" value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value })} />
      <label className="block text-sm">Yer</label>
      <input className="w-full rounded border p-2" value={data.location} onChange={(e) => onChange({ ...data, location: e.target.value })} />
      {showDate && (
        <>
          <label className="block text-sm">Etkinlik tarihi</label>
          <input type="datetime-local" className="w-full rounded border p-2" value={valueDate} onChange={(e) => onChangeDate(e.target.value)} />
        </>
      )}
    </div>
  );
} 
"use client";

import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { buttonVariants } from "@/components/ui-elements/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/media/ImageUploader";

export type CommitteeDraft = {
  name: string;
  role: string;
  image: string | null;
};

export default function CommitteeFormClient({ initial, mode, id }: { initial?: Partial<CommitteeDraft>; mode: "new" | "edit"; id?: string }) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<CommitteeDraft>({
    name: initial?.name || "",
    role: initial?.role || "",
    image: initial?.image || null,
  });

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (mode === "new") {
        const { error: e } = await supabase.from("committees").insert({ name: draft.name, role: draft.role, image: draft.image });
        if (e) throw e;
      } else if (mode === "edit" && id) {
        const { error: e } = await supabase.from("committees").update({ name: draft.name, role: draft.role, image: draft.image }).eq("id", id);
        if (e) throw e;
      }
      router.replace("/content/committees");
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm("Delete this member? This cannot be undone.")) return;
    setSaving(true);
    try {
      await supabase.from("committees").delete().eq("id", id);
      router.replace("/content/committees");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{mode === "new" ? "New Member" : "Edit Member"}</h1>
        <div className="flex gap-2">
          {mode === "edit" && (
            <button className={cn(buttonVariants({ variant: "outlineDark", shape: "rounded", size: "small" }))} onClick={handleDelete} disabled={saving}>
              Delete
            </button>
          )}
          <button className={cn(buttonVariants({ variant: "primary", shape: "rounded", size: "small" }))} onClick={handleSave} disabled={saving}>
            Save
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded border p-4 dark:border-dark-3 space-y-3">
            <label className="block text-sm">Name</label>
            <input className="w-full rounded border p-2" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />

            <label className="block text-sm">Role</label>
            <input className="w-full rounded border p-2" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded border p-4 dark:border-dark-3">
            <h2 className="mb-2 font-medium">Avatar</h2>
            <ImageUploader folder="committees" initialUrl={draft.image} onUploaded={(url) => setDraft({ ...draft, image: url })} />
          </div>
        </div>
      </div>
    </div>
  );
} 
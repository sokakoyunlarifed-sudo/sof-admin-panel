"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { buttonVariants } from "@/components/ui-elements/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type Role = "user" | "admin" | null;

export type AnnouncementRow = {
  id: string;
  title: string;
  date: string | null;
  location: string | null;
  created_at: string | null;
  image: string | null;
};

export default function AnnouncementsListClient({ initial, role }: { initial: AnnouncementRow[]; role: Role }) {
  const [rows, setRows] = useState<AnnouncementRow[]>(initial);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  async function load() {
    setLoading(true);
    try {
      let query = supabase
        .from("announcements")
        .select("id,title,date,location,created_at,image")
        .order("created_at", { ascending: false });
      if (search) query = query.ilike("title", `%${search}%`);
      const { data } = await query;
      setRows((data || []) as any);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function remove(id: string) {
    if (!confirm("Bu duyuruyu silmek istiyor musunuz? Bu işlem geri alınamaz.")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (!error) setRows((r) => r.filter((x) => x.id !== id));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <input
            className="w-full max-w-sm rounded border p-2"
            placeholder="Başlık ara"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link href="/content/announcements/new" className={cn(buttonVariants({ variant: "primary", shape: "rounded", size: "small" }))}>
          Yeni Duyuru
        </Link>
      </div>

      <div className="overflow-hidden rounded border border-gray-200 dark:border-dark-3">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-3">
          <thead className="bg-gray-50 dark:bg-dark-3">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">Başlık</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Tarih</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Yer</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Oluşturulma</th>
              <th className="px-4 py-2 text-right text-sm font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-3">
            {rows.map((n) => (
              <tr key={n.id}>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    {n.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.image} alt="thumb" className="h-10 w-10 rounded object-cover" />
                    )}
                    <div>
                      <div className="truncate font-medium">{n.title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 text-sm">{n.date ? new Date(n.date).toLocaleDateString() : ""}</td>
                <td className="px-4 py-2 text-sm">{n.location || ""}</td>
                <td className="px-4 py-2 text-sm">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ""}</td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/content/announcements/${n.id}/edit`} className={cn(buttonVariants({ variant: "outlineDark", shape: "rounded", size: "small" }))}>
                      Düzenle
                    </Link>
                    {role === "admin" && (
                      <button onClick={() => remove(n.id)} className={cn(buttonVariants({ variant: "outlineDark", shape: "rounded", size: "small" }))} disabled={loading}>
                        Sil
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-dark-6">
                  {loading ? "Yükleniyor..." : "Sonuç bulunamadı"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function getCount(table: string) {
  const supabase = await getSupabaseServerClient();
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
  return count || 0;
}

export default async function ContentSummary() {
  const [news, announcements, committees] = await Promise.all([
    getCount("news"),
    getCount("announcements"),
    getCount("committees"),
  ]);

  const items = [
    { label: "News", value: news },
    { label: "Announcements", value: announcements },
    { label: "Committees", value: committees },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark">
          <div className="mb-2 text-sm font-medium text-dark-6">{it.label}</div>
          <div className="text-2xl font-bold text-dark dark:text-white">{it.value}</div>
        </div>
      ))}
    </div>
  );
} 
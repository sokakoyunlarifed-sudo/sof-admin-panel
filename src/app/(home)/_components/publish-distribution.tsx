import { getSupabaseServerClient } from "@/lib/supabase/server";

async function getCount(table: string) {
  const supabase = await getSupabaseServerClient();
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
  return count || 0;
}

export default async function PublishDistribution() {
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
    <div className="rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark">
      <h3 className="mb-3 text-base font-semibold">Content Totals</h3>
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between text-sm">
            <span>{it.label}</span>
            <span className="text-xs text-dark-6">{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 
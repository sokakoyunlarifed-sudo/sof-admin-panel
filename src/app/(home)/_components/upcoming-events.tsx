import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function LatestAnnouncements() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("announcements")
    .select("id,title,date,location")
    .order("date", { ascending: false })
    .limit(6);

  return (
    <div className="flex h-full flex-col rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark">
      <h3 className="mb-3 text-base font-semibold">En Son Duyurular</h3>
      <ul className="space-y-2">
        {(data || []).length === 0 && (
          <li className="rounded bg-gray-2 p-3 text-sm text-dark-6 dark:bg-dark-3">Duyuru yok</li>
        )}
        {(data || []).map((e) => (
          <li key={e.id} className="rounded bg-gray-2 p-3 text-sm dark:bg-dark-3">
            <div className="truncate font-medium">{e.title}</div>
            <div className="mt-0.5 text-xs text-dark-6">
              {e.date ? new Date(e.date).toLocaleDateString() : ""}
              {e.location ? ` · ${e.location}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 
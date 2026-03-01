import { pool } from "@/lib/db";

async function getCount(table: string) {
  const { rows } = await pool.query(`SELECT COUNT(id) FROM public.${table}`);
  return parseInt(rows[0].count, 10) || 0;
}

export default async function PublishDistribution() {
  const [news, announcements, committees] = await Promise.all([
    getCount("news"),
    getCount("announcements"),
    getCount("committees"),
  ]);

  const items = [
    { label: "Haberler", value: news },
    { label: "Duyurular", value: announcements },
    { label: "Kurullar", value: committees },
  ];

  return (
    <div className="rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark">
      <h3 className="mb-3 text-base font-semibold">İçerik Toplamları</h3>
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
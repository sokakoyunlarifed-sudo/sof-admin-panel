import { getCurrentUserWithRole } from "@/lib/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function prettyAction(action: string, metadata?: any) {
  switch (action) {
    case "deploy_triggered": {
      const status = metadata?.status;
      return status ? `Yayın tetiklendi (durum ${status})` : "Yayın tetiklendi";
    }
    case "login":
      return "Kullanıcı giriş yaptı";
    case "logout":
      return "Kullanıcı çıkış yaptı";
    case "password_changed":
      return "Şifre değiştirildi";
    case "signout_others":
      return "Diğer oturumlardan çıkış yapıldı";
    case "news_created_published":
      return "Haber yayınlandı (yeni)";
    case "news_created_draft":
      return "Haber taslak olarak kaydedildi (yeni)";
    case "news_updated":
      return "Haber güncellendi";
    case "news_published":
      return "Haber yayınlandı";
    case "news_unpublished":
      return "Haber yayından kaldırıldı";
    case "news_deleted":
      return "Haber silindi";
    case "project_created_published":
      return "Proje yayınlandı (yeni)";
    case "project_created_draft":
      return "Proje taslak olarak kaydedildi (yeni)";
    case "project_updated":
      return "Proje güncellendi";
    case "project_published":
      return "Proje yayınlandı";
    case "project_unpublished":
      return "Proje yayından kaldırıldı";
    case "project_deleted":
      return "Proje silindi";
    case "event_created_published":
      return "Etkinlik yayınlandı (yeni)";
    case "event_created_draft":
      return "Etkinlik taslak olarak kaydedildi (yeni)";
    case "event_updated":
      return "Etkinlik güncellendi";
    case "event_published":
      return "Etkinlik yayınlandı";
    case "event_unpublished":
      return "Etkinlik yayından kaldırıldı";
    case "event_deleted":
      return "Etkinlik silindi";
    default:
      return action;
  }
}

export default async function LogsPage(props: any) {
  const { role } = await getCurrentUserWithRole();
  if (role !== "admin") return null;

  const supabase = await getSupabaseServerClient();

  const limit = 50;
  const sp = (await props?.searchParams) || {};
  const page = Number((sp.page as string) || "1");
  const action = (sp.action as string) || "";
  const actor = (sp.actor as string) || "";

  let query = supabase
    .from("audit_logs")
    .select("id, created_at, actor_email, action, entity_type, entity_id, ip, user_agent, metadata", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (action) query = query.ilike("action", `%${action}%`);
  if (actor) query = query.ilike("actor_email", `%${actor}%`);

  const { data, count } = await query;

  const totalPages = Math.max(1, Math.ceil((count || 0) / limit));

  return (
    <div className="w-full max-w-none px-4 xl:px-6">
      <h1 className="mb-4 text-xl font-semibold">Aktivite Kayıtları</h1>

      <form className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm">Eylem</label>
          <input name="action" defaultValue={action} className="w-full rounded border p-2" placeholder="örn. event_updated" />
        </div>
        <div>
          <label className="mb-1 block text-sm">Aktör (e-posta)</label>
          <input name="actor" defaultValue={actor} className="w-full rounded border p-2" placeholder="email@ornek.com" />
        </div>
        <div className="flex items-end">
          <button className="rounded-lg bg-primary px-6 py-[9px] font-medium text-gray-2 hover:bg-opacity-90" type="submit">Uygula</button>
        </div>
      </form>

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
        <table className="w-full table-auto text-left text-sm">
          <thead className="bg-gray-2 text-xs font-medium dark:bg-dark-2">
            <tr>
              <th className="p-3">Zaman</th>
              <th className="p-3">Aktör</th>
              <th className="p-3">Eylem</th>
              <th className="p-3">Varlık</th>
              <th className="p-3">IP</th>
              <th className="p-3">UA</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((log) => (
              <tr key={log.id} className="border-t border-stroke align-top dark:border-dark-3">
                <td className="p-3 whitespace-nowrap">{new Date(log.created_at as any).toLocaleString()}</td>
                <td className="p-3 whitespace-nowrap">{log.actor_email}</td>
                <td className="p-3">
                  <div className="font-medium">{prettyAction(log.action, log.metadata)}</div>
                </td>
                <td className="p-3">{log.entity_type || "-"} {log.entity_id || ""}</td>
                <td className="p-3 whitespace-nowrap">{log.ip || "-"}</td>
                <td className="p-3 text-xs break-all">{log.user_agent || "-"}</td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td className="p-5 text-center text-dark-6" colSpan={6}>Kayıt yok</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-dark-6">Sayfa {page} / {totalPages}</div>
        <div className="flex gap-2">
          <a className="rounded border px-3 py-1 text-sm disabled:opacity-40" href={`?action=${encodeURIComponent(action)}&actor=${encodeURIComponent(actor)}&page=${Math.max(1, page - 1)}`}>Önceki</a>
          <a className="rounded border px-3 py-1 text-sm disabled:opacity-40" href={`?action=${encodeURIComponent(action)}&actor=${encodeURIComponent(actor)}&page=${Math.min(totalPages, page + 1)}`}>Sonraki</a>
        </div>
      </div>
    </div>
  );
} 
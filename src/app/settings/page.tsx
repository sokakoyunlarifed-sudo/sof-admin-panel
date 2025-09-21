import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserWithRole } from "@/lib/profile";
import DeployButton from "./_components/DeployButton";
import ChangePasswordModal from "./_components/ChangePasswordModal";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { role, user } = await getCurrentUserWithRole();
  const supabase = await getSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, role")
    .eq("id", user?.id || "")
    .single();

  const email = profile?.email || user?.email || "";
  const effectiveRole = profile?.role || role || "";

  return (
    <div className="mx-auto w-full max-w-[900px]">
      <h1 className="mb-4 text-xl font-semibold">Ayarlar</h1>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark xl:col-span-2">
          <h2 className="mb-3 text-base font-semibold">Hesap</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm">E-posta</label>
              <input className="w-full rounded border p-2" value={email} disabled />
            </div>
            <div>
              <label className="mb-1 block text-sm">Rol</label>
              <input className="w-full rounded border p-2" value={effectiveRole} disabled />
            </div>
          </div>
        </div>

        <div className="rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark">
          <h2 className="mb-3 text-base font-semibold">Avatar</h2>
          <p className="text-sm text-dark-6">Avatar yönetimi Profiller bölümünden yapılır.</p>
        </div>
      </div>

      {/* Deploy card moved up here */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="relative overflow-hidden rounded-[14px] border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-5 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:border-primary/30 dark:from-primary/20 xl:col-span-3">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/15 blur-2xl dark:bg-primary/25" />
          <h2 className="mb-2 text-base font-semibold">Yeniden Yayınla</h2>
          <p className="mb-3 text-sm text-dark-6">Statik içeriği yenilemek için siteyi yeniden dağıtın. Bekleme süresi: 3 dakika.</p>
          <DeployButton />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {role === "admin" ? (
          <div className="rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark xl:col-span-2">
            <h2 className="mb-3 text-base font-semibold">Şifre Değiştir</h2>
            <ChangePasswordModal />
          </div>
        ) : null}

        <div className="rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark">
          <h2 className="mb-3 text-base font-semibold">Aktif Oturumlar</h2>
          <form action="/api/auth/signout-others" method="post">
            <p className="mb-3 text-sm text-dark-6">Diğer cihaz ve tarayıcılardan çıkış yapın.</p>
            <button className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white" type="submit">
              Diğer oturumlardan çıkış yap
            </button>
          </form>
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-medium text-dark-6">Son girişler</h3>
            <MyLoginHistory />
          </div>
        </div>
      </div>
    </div>
  );
}

async function MyLoginHistory() {
  "use server";
  const { user } = await getCurrentUserWithRole();
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("id, created_at, action, ip, user_agent")
    .eq("actor_id", user?.id || "")
    .in("action", ["login", "logout"])
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <ul className="space-y-1 text-xs text-dark-6">
      {(data || []).map((log) => (
        <li key={log.id} className="truncate">
          <span className="font-medium">{log.action}</span> • {new Date(log.created_at as any).toLocaleString()} • {log.ip || "-"}
        </li>
      ))}
      {!data?.length && <li>Geçmiş yok.</li>}
    </ul>
  );
} 
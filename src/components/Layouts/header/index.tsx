"use client";

import { useProfileRole } from "@/hooks/use-role";
import { ThemeToggleSwitch } from "./theme-toggle";
import HeaderUserInfo from "./user-info";
import { usePathname } from "next/navigation";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";

function getPageMeta(pathname: string) {
  const map: Array<{ test: RegExp; title: string; subtitle?: string }> = [
    { test: /^\/$/, title: "Genel Bakış", subtitle: "Özet metrikler ve hızlı içgörüler" },
    { test: /^\/calendar/, title: "Takvim", subtitle: "Planla ve programını takip et" },
    { test: /^\/content\/news/, title: "Haberler", subtitle: "Haber oluştur ve yönet" },
    { test: /^\/content\/announcements/, title: "Duyurular", subtitle: "Duyuru oluştur ve yönet" },
    { test: /^\/content\/committees/, title: "Kurullar", subtitle: "Kurul üyelerini yönet" },
    { test: /^\/media/, title: "Medya Kütüphanesi", subtitle: "Varlıkları yükle ve yönet" },
    { test: /^\/users/, title: "Kullanıcılar", subtitle: "Erişim kontrolü ve roller" },
    { test: /^\/forms/, title: "Formlar", subtitle: "Örnekler ve kalıplar" },
    { test: /^\/tables/, title: "Tablolar", subtitle: "Veri görünümleri ve listeler" },
    { test: /^\/pages\/settings/, title: "Ayarlar", subtitle: "Profil, güvenlik ve tercihleri" },
    { test: /^\/profile/, title: "Profil", subtitle: "Kişisel bilgileriniz" },
  ];
  for (const r of map) if (r.test.test(pathname)) return r;
  return { title: "Genel Bakış", subtitle: "Özet metrikler ve hızlı içgörüler" };
}

export function Header() {
  const { role, loading } = useProfileRole();
  const pathname = usePathname();
  const { toggleSidebar } = useSidebarContext();
  if (loading) return null;
  if (role !== "admin") return null;

  const { title, subtitle } = getPageMeta(pathname || "/");

  return (
    <header className="sticky top-0 z-40 border-b border-stroke bg-white/90 backdrop-blur-sm dark:border-dark-3 dark:bg-gray-dark/80">
      <div className="flex items-center justify-between px-6 py-5 md:px-8 md:py-6">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="rounded-lg border px-2.5 py-2 text-dark hover:bg-gray-100 dark:border-dark-3 dark:text-white dark:hover:bg-[#FFFFFF1A] xl:hidden"
            aria-label="Kenar çubuğunu aç/kapat"
          >
            <MenuIcon />
          </button>

          <div className="max-xl:hidden">
            <h1 className="mb-1 text-2xl font-bold text-dark dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-dark-4 dark:text-dark-6">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggleSwitch />
          <HeaderUserInfo />
        </div>
      </div>
    </header>
  );
}

import React from "react";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Suspense } from "react";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { getCurrentUserWithRole } from "@/lib/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LatestAnnouncements from "./_components/upcoming-events";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui-elements/button";
import { PaymentsOverview } from "@/components/Charts/payments-overview";

export const dynamic = "force-dynamic";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);
  const { role } = await getCurrentUserWithRole();

  const [{ data: latestNews }, { data: latestAnnouncements }, { data: latestCommittees }, mediaList] = await Promise.all([
    supabase.from("news").select("id,title,created_at").order("created_at", { ascending: false }).limit(3),
    supabase.from("announcements").select("id,title,date,created_at").order("date", { ascending: false }).limit(3),
    supabase.from("committees").select("id,name,created_at").order("created_at", { ascending: false }).limit(3),
    supabase.storage.from("mediaa").list("", { limit: 24, sortBy: { column: "created_at", order: "desc" } }),
  ]);

  const recentFiles = (mediaList.data || []).filter((m) => m.name.includes(".")).slice(0, 12);

  return (
    <div>
      {role && (
        <div className="mb-4 rounded-md bg-gray-2 px-3 py-2 text-sm text-dark dark:bg-dark-3 dark:text-dark-6">
          Giriş yapılan rol: <strong>{role}</strong>
        </div>
      )}

      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      {/* Quick actions */}
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/content/news/new" className={cn(buttonVariants({ variant: "primary", shape: "rounded", size: "small" }))}>Yeni Haber</Link>
        <Link href="/content/announcements/new" className={cn(buttonVariants({ variant: "primary", shape: "rounded", size: "small" }))}>Yeni Duyuru</Link>
        <Link href="/content/committees/new" className={cn(buttonVariants({ variant: "primary", shape: "rounded", size: "small" }))}>Yeni Kurul Üyesi</Link>
      </div>

      {/* Content Overview chart */}
      <div className="mt-4">
        <PaymentsOverview timeFrame={extractTimeFrame("payments_overview")?.split(":")[1]} />
      </div>

      {/* Latest News + Latest Announcements + Latest Committees + Media */}
      <div className="mt-4 grid grid-cols-12 gap-5 md:gap-6">
        <div className="col-span-12 xl:col-span-6">
          <div className="h-full rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark">
            <h3 className="mb-3 text-base font-semibold">En Son Haberler</h3>
            <ul className="space-y-2">
              {(latestNews || []).map((n) => (
                <li key={n.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{n.title}</span>
                  <Link href={`/content/news/${n.id}/edit`} className={cn(buttonVariants({ variant: "outlineDark", shape: "rounded", size: "small" }))}>Düzenle</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-span-12 xl:col-span-6">
          <div className="h-full rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark">
            <h3 className="mb-3 text-base font-semibold">En Son Duyurular</h3>
            <ul className="space-y-2">
              {(latestAnnouncements || []).map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{a.title}</span>
                  <Link href={`/content/announcements/${a.id}/edit`} className={cn(buttonVariants({ variant: "outlineDark", shape: "rounded", size: "small" }))}>Düzenle</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-span-12 xl:col-span-6">
          <div className="h-full rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark">
            <h3 className="mb-3 text-base font-semibold">En Son Kurullar</h3>
            <ul className="space-y-2">
              {(latestCommittees || []).map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{c.name}</span>
                  <Link href={`/content/committees/${c.id}/edit`} className={cn(buttonVariants({ variant: "outlineDark", shape: "rounded", size: "small" }))}>Düzenle</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-span-12 xl:col-span-6">
          <LatestAnnouncements />
        </div>
        <div className="col-span-12">
          <div className="rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark">
            <h3 className="mb-3 text-base font-semibold">Son Medya</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
              {recentFiles.map((m) => (
                <div key={m.name} className="aspect-square overflow-hidden rounded bg-gray-2 dark:bg-dark-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={supabase.storage.from("mediaa").getPublicUrl(m.name).data.publicUrl} alt={m.name} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

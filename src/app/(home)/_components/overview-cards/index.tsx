import { compactFormat } from "@/lib/format-number";
import { OverviewCard } from "./card";
import * as icons from "./icons";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { pool } from "@/lib/db";

export async function OverviewCardsGroup() {
  const [news, announcements, committees, profiles] = await Promise.all([
    pool.query(`SELECT COUNT(id) FROM public.news`),
    pool.query(`SELECT COUNT(id) FROM public.announcements`),
    pool.query(`SELECT COUNT(id) FROM public.committees`),
    pool.query(`SELECT COUNT(id) FROM public.profiles`).catch(() => ({ rows: [{ count: 0 }] })), // Profiles might be dropped
  ]);

  const totalNews = parseInt(news.rows[0].count, 10) || 0;
  const totalAnnouncements = parseInt(announcements.rows[0].count, 10) || 0;
  const totalCommittees = parseInt(committees.rows[0].count, 10) || 0;
  const totalUsers = parseInt(profiles.rows[0].count, 10) || 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Haberler"
        data={{ value: compactFormat(totalNews) }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="Duyurular"
        data={{ value: compactFormat(totalAnnouncements) }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Kurullar"
        data={{ value: compactFormat(totalCommittees) }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Kullanıcılar"
        data={{ value: compactFormat(totalUsers) }}
        Icon={icons.Users}
      />
    </div>
  );
}

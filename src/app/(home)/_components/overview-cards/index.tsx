import { compactFormat } from "@/lib/format-number";
import { OverviewCard } from "./card";
import * as icons from "./icons";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function OverviewCardsGroup() {
  const supabase = await getSupabaseServerClient();

  const [news, announcements, committees, profiles] = await Promise.all([
    supabase.from("news").select("id", { count: "exact", head: true }),
    supabase.from("announcements").select("id", { count: "exact", head: true }),
    supabase.from("committees").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const totalNews = news.count || 0;
  const totalAnnouncements = announcements.count || 0;
  const totalCommittees = committees.count || 0;
  const totalUsers = profiles.count || 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="News"
        data={{ value: compactFormat(totalNews) }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="Announcements"
        data={{ value: compactFormat(totalAnnouncements) }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Committees"
        data={{ value: compactFormat(totalCommittees) }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Users"
        data={{ value: compactFormat(totalUsers) }}
        Icon={icons.Users}
      />
    </div>
  );
}

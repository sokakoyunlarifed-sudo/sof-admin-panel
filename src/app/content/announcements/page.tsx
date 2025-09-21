import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/profile";
import AnnouncementsListClient, { AnnouncementRow } from "./AnnouncementsListClient";

export const dynamic = "force-dynamic";

export default async function AnnouncementsListPage() {
  const { role } = await getCurrentUserWithRole();
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("announcements")
    .select("id,title,date,location,created_at,image")
    .order("created_at", { ascending: false });

  if (!role) redirect("/auth/sign-in");
  if (role !== "admin") redirect("/");

  return <AnnouncementsListClient initial={(data as AnnouncementRow[]) || []} role={role} />;
} 
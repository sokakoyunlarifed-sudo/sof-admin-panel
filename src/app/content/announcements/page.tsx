import { redirect } from "next/navigation";
import AnnouncementsListClient, { AnnouncementRow } from "./AnnouncementsListClient";
import { getCurrentUserWithRole } from "@/lib/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AnnouncementsListPage() {
  const { role } = await getCurrentUserWithRole();
  const supabase = await getSupabaseServerClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, date, location, description, image, created_at")
    .order("created_at", { ascending: false });

  if (!role) redirect("/auth/sign-in");
  if (role !== "admin" && role !== "superadmin") redirect("/");

  return <AnnouncementsListClient initial={(announcements as unknown as AnnouncementRow[]) || []} role={role} />;
}
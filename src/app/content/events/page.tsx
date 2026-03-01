import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/profile";
import EventsListClient, { EventRow } from "./EventsListClient";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EventsListPage() {
  const { role } = await getCurrentUserWithRole();
  const supabase = await getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (!role) redirect("/auth/sign-in");
  if (role !== "admin") redirect("/");

  return <EventsListClient initial={(data as EventRow[]) || []} role={role} />;
}
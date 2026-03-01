import { getSupabaseServerClient } from "@/lib/supabase/server";
import AnnouncementsFormClient from "../../AnnouncementsFormClient";

export const dynamic = "force-dynamic";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .single();

  return (
    <AnnouncementsFormClient
      mode="edit"
      id={id}
      initial={data || undefined}
    />
  );
}
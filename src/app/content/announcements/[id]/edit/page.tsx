import { getSupabaseServerClient } from "@/lib/supabase/server";
import AnnouncementFormClient from "../../form-client";

export const dynamic = "force-dynamic";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("announcements")
    .select("id,title,date,location,description,image,created_at")
    .eq("id", id)
    .single();

  return <AnnouncementFormClient mode="edit" id={id} initial={data || undefined} />;
} 
import { getSupabaseServerClient } from "@/lib/supabase/server";
import ProjectFormClient from "../../ProjectFormClient";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  return (
    <ProjectFormClient
      mode="edit"
      id={id}
      initialEn={data || undefined}
      initialAz={data || undefined}
    />
  );
}
import { getSupabaseServerClient } from "@/lib/supabase/server";
import CommitteeFormClient from "../../CommitteeFormClient";

export const dynamic = "force-dynamic";

export default async function EditCommitteePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data } = await supabase
    .from("committees")
    .select("*")
    .eq("id", id)
    .single();

  return (
    <CommitteeFormClient
      mode="edit"
      id={id}
      initial={data || undefined}
    />
  );
}
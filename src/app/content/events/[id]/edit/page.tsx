import { getSupabaseServerClient } from "@/lib/supabase/server";
import EventsFormClient from "../../EventsFormClient";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  return (
    <EventsFormClient
      mode="edit"
      id={id}
      initial={data || undefined}
    />
  );
}
import { getSupabaseServerClient } from "@/lib/supabase/server";
import NewsFormClient from "../../NewsFormClient";

export const dynamic = "force-dynamic";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("news")
    .select("id,title,date,short_text,full_text,image,created_at")
    .eq("id", id)
    .single();

  return (
    <NewsFormClient
      mode="edit"
      id={id}
      initial={data || undefined}
    />
  );
} 
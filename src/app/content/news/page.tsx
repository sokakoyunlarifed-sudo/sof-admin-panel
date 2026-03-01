import { redirect } from "next/navigation";
import NewsListClient, { NewsRow } from "./NewsListClient";
import { getCurrentUserWithRole } from "@/lib/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewsListPage() {
  const { role } = await getCurrentUserWithRole();
  const supabase = await getSupabaseServerClient();

  const { data: news } = await supabase
    .from("news")
    .select("id, title, date, created_at, image")
    .order("created_at", { ascending: false });

  if (!role) redirect("/auth/sign-in");
  if (role !== "admin") redirect("/");

  return <NewsListClient initial={(news as unknown as NewsRow[]) || []} role={role} />;
}
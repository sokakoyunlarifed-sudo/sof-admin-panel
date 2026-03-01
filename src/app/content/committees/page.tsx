import { redirect } from "next/navigation";
import CommitteesListClient, { CommitteeRow } from "./CommitteesListClient";
import { getCurrentUserWithRole } from "@/lib/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CommitteesListPage() {
  const { role } = await getCurrentUserWithRole();
  const supabase = await getSupabaseServerClient();

  const { data: committees } = await supabase
    .from("committees")
    .select("id, name, role, created_at, image")
    .order("created_at", { ascending: false });

  if (!role) redirect("/auth/sign-in");
  if (role !== "admin") redirect("/");

  return <CommitteesListClient initial={(committees as unknown as CommitteeRow[]) || []} role={role} />;
}
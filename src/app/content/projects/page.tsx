import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/profile";
import ProjectsListClient, { ProjectRow } from "./ProjectsListClient";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProjectsListPage() {
  const { role } = await getCurrentUserWithRole();
  const supabase = await getSupabaseServerClient();

  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (!role) redirect("/auth/sign-in");
  if (role !== "admin") redirect("/");

  return <ProjectsListClient initial={(data as ProjectRow[]) || []} role={role} />;
}
import { pool } from "@/lib/db";
import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/profile";
import ProjectsListClient, { ProjectRow } from "./ProjectsListClient";

export const dynamic = "force-dynamic";

export default async function ProjectsListPage() {
  const { role } = await getCurrentUserWithRole();
    let data: any[] = [];
  try {
    const result = await pool.query(
      "SELECT * FROM public.projects ORDER BY created_at DESC"
    );
    data = result.rows.map((row: any) => ({
      ...row,
      date: row.date ? new Date(row.date).toISOString() : null,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    }));
  } catch (err) {
    console.error(err);
  }

  if (!role) redirect("/auth/sign-in");
  if (role !== "admin") redirect("/");

  return <ProjectsListClient initial={(data as ProjectRow[]) || []} role={role} />;
} 
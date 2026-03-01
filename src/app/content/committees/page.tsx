import { redirect } from "next/navigation";
import CommitteesListClient, { CommitteeRow } from "./CommitteesListClient";
import { getCurrentUserWithRole } from "@/lib/profile";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CommitteesListPage() {
  const { role } = await getCurrentUserWithRole();
  let committees: any[] = [];
  try {
    const result = await pool.query(
      "SELECT id, name, role, created_at, image FROM public.committees ORDER BY created_at DESC"
    );
    committees = result.rows.map((row: any) => ({
      ...row,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    }));
  } catch (err) {
    console.error("CommitteesListPage Error:", err);
  }

  if (!role) redirect("/auth/sign-in");
  if (role !== "admin") redirect("/");

  return <CommitteesListClient initial={(committees as unknown as CommitteeRow[]) || []} role={role} />;
}
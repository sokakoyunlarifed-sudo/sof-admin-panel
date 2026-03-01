import { pool } from "@/lib/db";
import CommitteeFormClient from "../../form-client";

export const dynamic = "force-dynamic";

export default async function EditCommitteePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data = null;

  try {
    const result = await pool.query(
      "SELECT id, name, role, image, created_at FROM public.committees WHERE id = $1",
      [id]
    );
    if (result.rows.length > 0) {
      data = result.rows[0];
      if (data.created_at) data.created_at = new Date(data.created_at).toISOString();
    }
  } catch (err) {
    console.error(err);
  }

  return <CommitteeFormClient mode="edit" id={id} initial={data || undefined} />;
}
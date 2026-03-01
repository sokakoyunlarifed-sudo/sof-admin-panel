import { pool } from "@/lib/db";
import AnnouncementFormClient from "../../form-client";

export const dynamic = "force-dynamic";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data = null;

  try {
    const result = await pool.query(
      "SELECT id, title, date, location, description, image, created_at FROM public.announcements WHERE id = $1",
      [id]
    );
    if (result.rows.length > 0) {
      data = result.rows[0];
      if (data.date) data.date = new Date(data.date).toISOString();
      if (data.created_at) data.created_at = new Date(data.created_at).toISOString();
    }
  } catch (err) {
    console.error(err);
  }

  return (
    <AnnouncementFormClient
      mode="edit"
      id={id}
      initial={data || undefined}
    />
  );
}
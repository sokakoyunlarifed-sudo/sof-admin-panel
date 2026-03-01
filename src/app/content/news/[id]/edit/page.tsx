import { pool } from "@/lib/db";
import NewsFormClient from "../../NewsFormClient";

export const dynamic = "force-dynamic";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let data = null;
  try {
    const result = await pool.query(
      `SELECT n.id, n.title, n.date, n.short_text, n.full_text, n.image, n.video_url, n.created_at,
       (SELECT json_agg(ni.image_url) FROM news_images ni WHERE ni.news_id = n.id) as images
       FROM public.news n WHERE n.id = $1`,
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
    <NewsFormClient
      mode="edit"
      id={id}
      initial={data || undefined}
    />
  );
}
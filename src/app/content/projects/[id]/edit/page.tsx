import { pool } from "@/lib/db";
import ProjectFormClient from "../../ProjectFormClient";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let en: any = null;
  let az: any = null;

  try {
    const resEn = await pool.query(
      "SELECT id,title,summary,content,slug,image_url,published_at,created_at FROM public.projects WHERE id = $1",
      [id]
    );
    en = resEn.rows[0];

    if (en?.slug) {
      const resAz = await pool.query(
        "SELECT title,summary,content,slug,image_url,published_at,created_at FROM public.projects_az WHERE slug = $1",
        [en.slug]
      );
      if (resAz.rows.length > 0) {
        az = resAz.rows[0];
      }
    }
  } catch (err) {
    console.error(err);
  }

  return (
    <ProjectFormClient
      mode="edit"
      id={id}
      initialEn={en || undefined}
      initialAz={az || undefined}
    />
  );
}
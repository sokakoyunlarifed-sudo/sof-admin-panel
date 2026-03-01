import { pool } from "@/lib/db";
import EventFormClient from "../../EventFormClient";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let en: any = null;
  let az: any = null;

  try {
    const resEn = await pool.query(
      "SELECT id,title,description,location,event_date,image_url,published_at,created_at FROM public.events WHERE id = $1",
      [id]
    );
    en = resEn.rows[0];

    if (en?.title && en?.event_date) {
      const resAz = await pool.query(
        "SELECT title,description,location,event_date,image_url,published_at,created_at FROM public.events_az WHERE title = $1 AND event_date = $2",
        [en.title, en.event_date]
      );
      if (resAz.rows.length > 0) {
        az = resAz.rows[0];
      }
    }
  } catch (err) {
    console.error(err);
  }

  return (
    <EventFormClient
      mode="edit"
      id={id}
      initialEn={en || undefined}
      initialAz={az || undefined}
    />
  );
}
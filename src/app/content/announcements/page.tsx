import { redirect } from "next/navigation";
import AnnouncementsListClient, { AnnouncementRow } from "./AnnouncementsListClient";
import { getCurrentUserWithRole } from "@/lib/profile";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AnnouncementsListPage() {
  const { role } = await getCurrentUserWithRole();
  let announcements: any[] = [];
  try {
    const result = await pool.query(
      "SELECT id, title, date, location, description, image, created_at FROM public.announcements ORDER BY created_at DESC"
    );
    announcements = result.rows.map((row: any) => ({
      ...row,
      date: row.date ? new Date(row.date).toISOString() : null,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    }));
  } catch (err) {
    console.error("AnnouncementsListPage Error:", err);
  }

  if (!role) redirect("/auth/sign-in");
  if (role !== "admin") redirect("/");

  return <AnnouncementsListClient initial={(announcements as unknown as AnnouncementRow[]) || []} role={role} />;
}
import { pool } from "@/lib/db";
import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/profile";
import EventsListClient, { EventRow } from "./EventsListClient";

export const dynamic = "force-dynamic";

export default async function EventsListPage() {
  const { role } = await getCurrentUserWithRole();
    let data: any[] = [];
  try {
    const result = await pool.query(
      "SELECT * FROM public.events ORDER BY created_at DESC"
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

  return <EventsListClient initial={(data as EventRow[]) || []} role={role} />;
} 
import { redirect } from "next/navigation";
import NewsListClient, { NewsRow } from "./NewsListClient";
import { getCurrentUserWithRole } from "@/lib/profile";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewsListPage() {
  const { role } = await getCurrentUserWithRole();

  let news: any[] = [];
  try {
    const result = await pool.query(
      "SELECT id, title, date, created_at, image FROM public.news ORDER BY created_at DESC"
    );
    news = result.rows.map((row: any) => ({
      ...row,
      date: row.date ? new Date(row.date).toISOString() : null,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    }));
  } catch (err) {
    console.error("NewsListPage Error:", err);
  }

  if (!role) redirect("/auth/sign-in");
  if (role !== "admin") redirect("/");

  return <NewsListClient initial={(news as unknown as NewsRow[]) || []} role={role} />;
}
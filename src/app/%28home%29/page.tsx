import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { buttonVariants } from "@/components/ui-elements/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default async function HomePage() {
  const supabase = await getSupabaseServerClient();
  const [{ data: latestNews }] = await Promise.all([
    supabase.from("news").select("id,title,created_at,image").order("created_at", { ascending: false }).limit(3),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Link href="/content/news/new" className={cn(buttonVariants({ variant: "primary", shape: "rounded", size: "small" }))}>New News</Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded border p-4 dark:border-dark-3">
          <h3 className="mb-3 text-base font-semibold">Latest News</h3>
          <ul className="space-y-2">
            {(latestNews || []).map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {Boolean((n as any).image) && (
                    <Image src={(n as any).image} alt="thumb" width={32} height={32} className="h-8 w-8 rounded object-cover" />
                  )}
                  <span className="text-sm">{n.title}</span>
                </div>
                <Link href={`/content/news/${n.id}/edit`} className={cn(buttonVariants({ variant: "outlineDark", shape: "rounded", size: "small" }))}>Edit</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 
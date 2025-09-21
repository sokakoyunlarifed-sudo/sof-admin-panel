import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const isMutable = typeof (cookieStore as any).set === "function";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (!isMutable) return;
          try {
            (cookieStore as any).set({ name, value, ...options });
          } catch {
            // ignore: not allowed to set cookies in this context
          }
        },
        remove(name: string, options: CookieOptions) {
          if (!isMutable) return;
          try {
            (cookieStore as any).set({ name, value: "", ...options });
          } catch {
            // ignore: not allowed to set cookies in this context
          }
        },
      },
    }
  );

  return supabase;
} 
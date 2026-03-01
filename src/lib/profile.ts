import type { ProfileRole } from "@/types/roles";

export async function getCurrentUserWithRole() {
  // Supabase is removed, return a mock user so SSR pages don't redirect to /auth/sign-in
  return {
    user: { id: "admin-id", email: "admin@sof.web.tr" },
    role: "admin" as ProfileRole
  };
}
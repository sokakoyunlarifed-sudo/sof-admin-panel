"use client";
import type { ProfileRole } from "@/types/roles";

export function useProfileRole() {
  // Hardcoded to admin since Supabase was removed and there's only one master admin
  return { role: "admin" as ProfileRole, loading: false } as const;
}
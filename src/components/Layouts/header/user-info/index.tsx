"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function HeaderUserInfo() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [role, setRole] = useState<"user" | "admin" | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return setRole(null);
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", u.user.id).single();
      setRole((profile?.role as any) || null);
    })();
  }, [supabase]);

  const roleLabel = role === "admin" ? "Admin" : role ? "Kullanıcı" : "";

  return <div className="text-sm text-dark-6">{roleLabel}</div>;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/browser-client";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="flex items-center gap-1.5 text-[13px] text-secondary transition-colors hover:text-ink disabled:opacity-60"
    >
      <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}

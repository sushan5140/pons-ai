import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { withRetry } from "@/lib/with-retry";

// The single source of truth for plan limits. profiles.plan decides which
// of these applies to a given user — see supabase/schema.sql section 8
// for how to manually grant Pro to a test/demo account.
export const PLAN_LIMITS = {
  free: 5,
  pro: 25,
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

export interface UsageStatus {
  plan: Plan;
  used: number;
  limit: number;
  remaining: number;
  allowed: boolean;
}

function currentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * The one place upload limits are decided. Called both when enforcing the
 * limit (process-screenshot route, before any Gemini/storage work happens)
 * and when displaying it (usage route, for the "X of Y used" indicator) —
 * so those two can never drift out of sync.
 */
export async function checkUsageLimit(userId: string): Promise<UsageStatus> {
  const supabase = getSupabaseAdmin();

  const { data: profile } = await withRetry(() =>
    supabase.from("profiles").select("plan").eq("id", userId).single()
  );

  const plan: Plan = profile?.plan === "pro" ? "pro" : "free";
  const limit = PLAN_LIMITS[plan];

  const { start, end } = currentMonthRange();
  const { count } = await withRetry(() =>
    supabase
      .from("screenshots")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", start)
      .lt("created_at", end)
  );

  const used = count ?? 0;

  return {
    plan,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    allowed: used < limit,
  };
}

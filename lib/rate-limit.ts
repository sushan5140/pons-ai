import "server-only";

/**
 * In-process sliding-window rate limiter. Deliberately simple for this
 * project's current scale — no Redis/external service. This only protects
 * within a single warm serverless instance: on Vercel, a cold start or a
 * request routed to a different instance resets the count for that instance.
 * That's an accepted tradeoff for "stop rapid-fire abuse from one client",
 * not a guarantee against a distributed attacker. If usage grows to the
 * point that matters, swap the Map below for a Supabase-backed counter (or
 * Upstash/Redis) without changing the checkRateLimit call sites.
 */
const hits = new Map<string, number[]>();

// Sweeps stale keys periodically so this Map doesn't grow unbounded for the
// life of the server process.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = Date.now();

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, timestamps] of hits) {
    const kept = timestamps.filter((t) => now - t < windowMs);
    if (kept.length === 0) hits.delete(key);
    else hits.set(key, kept);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * @param key Unique identifier for the thing being limited, e.g. `upload:${userId}`.
 * @param limit Max requests allowed within the window.
 * @param windowMs Window size in milliseconds.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0];
    const retryAfterSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return { allowed: true, retryAfterSeconds: 0 };
}

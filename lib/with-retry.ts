import "server-only";

/**
 * Supabase client calls don't throw on failure — they resolve to an object
 * with an `error` field (plus `data`, and sometimes `count`). This retries
 * that shape a couple of times with a short backoff, since this app has
 * seen intermittent "fetch failed"-style network blips (confirmed
 * transient: the same call succeeds seconds later) that would otherwise
 * surface as a hard error mid-demo.
 */
export async function withRetry<T extends { error: unknown }>(
  fn: () => PromiseLike<T>,
  retries = 2,
  delayMs = 300
): Promise<T> {
  let result = await fn();
  let attempt = 0;
  while (result.error && attempt < retries) {
    await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    result = await fn();
    attempt++;
  }
  return result;
}

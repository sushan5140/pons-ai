import test from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "../lib/rate-limit.ts";

test("a short-window request cannot sweep another key's long-window hits", () => {
  const realNow = Date.now;
  const t0 = realNow();
  let now = t0;
  Date.now = () => now;
  try {
    assert.deepEqual(checkRateLimit("test:long-window", 1, 60 * 60_000), {
      allowed: true,
      retryAfterSeconds: 0,
    });
    assert.equal(checkRateLimit("test:long-window", 1, 60 * 60_000).allowed, false);

    // Advance past the five-minute sweep interval, then call a short-window
    // endpoint. A sweep must retain the hour-long request from the other key.
    now = t0 + 5 * 60_000 + 100;
    assert.equal(checkRateLimit("test:short-window", 1, 60_000).allowed, true);
    const stillBlocked = checkRateLimit("test:long-window", 1, 60 * 60_000);
    assert.equal(stillBlocked.allowed, false);
    assert.ok(stillBlocked.retryAfterSeconds > 0);

    // The short-window key expires on its own schedule; the long one does not.
    now += 60_001;
    assert.equal(checkRateLimit("test:short-window", 1, 60_000).allowed, true);
    assert.equal(checkRateLimit("test:long-window", 1, 60 * 60_000).allowed, false);

    // Exactly after the hour-long window the original key becomes eligible.
    now = t0 + 60 * 60_000 + 1;
    assert.equal(checkRateLimit("test:long-window", 1, 60 * 60_000).allowed, true);
  } finally {
    Date.now = realNow;
  }
});

test("blocked attempts do not extend the lockout window", () => {
  const realNow = Date.now;
  const t0 = realNow();
  let now = t0;
  Date.now = () => now;
  try {
    assert.equal(checkRateLimit("test:no-extension", 1, 60_000).allowed, true);
    now = t0 + 15_000;
    const blocked = checkRateLimit("test:no-extension", 1, 60_000);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.retryAfterSeconds, 45);

    now = t0 + 60_000;
    assert.equal(checkRateLimit("test:no-extension", 1, 60_000).allowed, true);
  } finally {
    Date.now = realNow;
  }
});

test("rate limits isolate distinct client keys", () => {
  assert.equal(checkRateLimit("test:client-a", 1, 60_000).allowed, true);
  assert.equal(checkRateLimit("test:client-b", 1, 60_000).allowed, true);
  assert.equal(checkRateLimit("test:client-a", 1, 60_000).allowed, false);
  assert.equal(checkRateLimit("test:client-b", 1, 60_000).allowed, false);
});

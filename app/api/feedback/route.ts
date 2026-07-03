import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-server";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 4000;
const FEEDBACK_RATE_LIMIT = 5;
const FEEDBACK_RATE_WINDOW_MS = 60 * 1000;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  // Feedback can come from a signed-out visitor on the landing page, so fall
  // back to IP for rate-limiting when there's no user id to key on.
  const rateLimitKey = user
    ? `feedback:${user.id}`
    : `feedback:${request.headers.get("x-forwarded-for") ?? "anonymous"}`;
  const rateLimit = checkRateLimit(rateLimitKey, FEEDBACK_RATE_LIMIT, FEEDBACK_RATE_WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "You're sending feedback too quickly — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: { message?: unknown; email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Couldn't read that submission." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!message) {
    return NextResponse.json({ error: "Please write a message first." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Please keep feedback under ${MAX_MESSAGE_LENGTH} characters.` },
      { status: 400 }
    );
  }
  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Feedback isn't configured yet. Add your Supabase keys to .env.local." },
      { status: 500 }
    );
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: user?.id ?? null,
    email: email || user?.email || null,
    message,
  });

  if (error) {
    console.error("Feedback insert failed:", error);
    const missingSchema = /relation .* does not exist|schema cache/i.test(error.message ?? "");
    return NextResponse.json(
      {
        error: missingSchema
          ? "The database schema is out of date. Run supabase/schema.sql, then try again."
          : "Couldn't send your feedback. Please try again.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-server";
import { analyzeScreenshot, buildEmbeddingSource, embedText } from "@/lib/gemini";
import { withRetry } from "@/lib/with-retry";
import { checkUsageLimit } from "@/lib/usage";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;
const BUCKET = "screenshots";

// Separate from the monthly plan limit in lib/usage.ts — this catches
// rapid-fire/automated requests within a short window, regardless of how
// many uploads the user has left for the month.
const UPLOAD_RATE_LIMIT = 5;
const UPLOAD_RATE_WINDOW_MS = 60 * 1000;

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`upload:${user.id}`, UPLOAD_RATE_LIMIT, UPLOAD_RATE_WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "You're uploading too quickly — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  // Checked before any Gemini/storage work — a blocked upload shouldn't
  // waste an API call or storage write.
  const usage = await checkUsageLimit(user.id);
  if (!usage.allowed) {
    const planLabel = usage.plan === "free" ? "free" : "Pro";
    return NextResponse.json(
      {
        error: `You've used all ${usage.limit} ${planLabel} uploads this month.${
          usage.plan === "free" ? " Upgrade to Pro for 25/month." : ""
        }`,
        usageLimitReached: true,
        usage,
      },
      { status: 403 }
    );
  }

  let file: File;
  try {
    const formData = await request.formData();
    const entry = formData.get("file");
    if (!(entry instanceof File)) {
      return NextResponse.json({ error: "No image was uploaded." }, { status: 400 });
    }
    file = entry;
  } catch {
    return NextResponse.json({ error: "Could not read the upload." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, and WEBP images are supported." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That image is too large (max 8MB)." }, { status: 400 });
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Storage isn't configured yet. Add your Supabase keys to .env.local." },
      { status: 500 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.type.split("/")[1] ?? "png";
  const storagePath = `${randomUUID()}.${extension}`;

  const { error: uploadError } = await withRetry(() =>
    supabase.storage.from(BUCKET).upload(storagePath, buffer, { contentType: file.type, upsert: false })
  );

  if (uploadError) {
    console.error("Supabase upload failed:", uploadError);
    const missingBucket = /bucket not found/i.test(uploadError.message ?? "");
    return NextResponse.json(
      {
        error: missingBucket
          ? "The 'screenshots' storage bucket doesn't exist yet. Run supabase/schema.sql, then try again."
          : "Couldn't store the image. Please try again.",
      },
      { status: 500 }
    );
  }

  let analysis;
  try {
    const base64 = buffer.toString("base64");
    analysis = await analyzeScreenshot(base64, file.type);
  } catch (err) {
    console.error("Gemini analysis failed:", err);
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json(
      { error: "The AI couldn't read this screenshot. Try a clearer image." },
      { status: 502 }
    );
  }

  // Embedding failures are non-fatal — the screenshot is still saved and
  // shown, it just won't surface in semantic search until it has one.
  let embedding: number[] | null = null;
  try {
    const embeddingSource = buildEmbeddingSource(analysis);
    if (embeddingSource) {
      embedding = await embedText(embeddingSource, "RETRIEVAL_DOCUMENT");
    }
  } catch (err) {
    console.error("Embedding generation failed:", err);
  }

  const { data: row, error: insertError } = await withRetry(() =>
    supabase
      .from("screenshots")
      .insert({
        image_url: storagePath,
        title: analysis.title,
        category: analysis.category,
        extracted_text: analysis.extracted_text,
        key_details: analysis.key_details,
        entities: analysis.entities,
        embedding,
        is_actionable: analysis.is_actionable,
        action_date: analysis.action_date,
        action_title: analysis.action_title,
        action_location: analysis.action_location,
        reminder_minutes_before: analysis.reminder_minutes_before,
        user_id: user.id,
      })
      .select()
      .single()
  );

  if (insertError) {
    console.error("Supabase insert failed:", {
      message: insertError.message,
      details: insertError.details,
      hint: insertError.hint,
      code: insertError.code,
    });
    const missingSchema =
      /relation .* does not exist|could not find the .* column|schema cache/i.test(
        insertError.message ?? ""
      );
    return NextResponse.json(
      {
        error: missingSchema
          ? "The database schema is out of date. Run supabase/schema.sql, then try again."
          : "The screenshot was read, but saving the result failed.",
      },
      { status: 500 }
    );
  }

  // Entity linking is non-fatal for the same reason as embeddings — a
  // screenshot is still fully usable even if it isn't linked into the
  // entity graph yet.
  if (analysis.entities.length > 0) {
    const { error: linkError } = await withRetry(() =>
      supabase.rpc("link_screenshot_entities", {
        p_screenshot_id: row.id,
        p_entities: analysis.entities,
        p_user_id: user.id,
      })
    );
    if (linkError) {
      console.error("Entity linking failed:", {
        message: linkError.message,
        details: linkError.details,
        hint: linkError.hint,
        code: linkError.code,
      });
    }
  }

  const { data: signedUrlData } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);

  return NextResponse.json({
    id: row.id,
    title: row.title,
    category: row.category,
    extracted_text: row.extracted_text,
    key_details: row.key_details,
    entities: row.entities,
    image_signed_url: signedUrlData?.signedUrl ?? null,
    is_actionable: row.is_actionable,
    action_date: row.action_date,
    action_title: row.action_title,
    action_location: row.action_location,
    action_confirmed: row.action_confirmed,
  });
}

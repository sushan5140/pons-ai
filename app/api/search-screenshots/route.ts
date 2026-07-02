import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { embedText } from "@/lib/gemini";
import { withRetry } from "@/lib/with-retry";

export const runtime = "nodejs";

const BUCKET = "screenshots";
const MATCH_COUNT = 5;

interface SnippetSource {
  extracted_text: string;
  key_details: Record<string, unknown>;
}

interface ActionFields {
  is_actionable: boolean;
  action_date: string | null;
  action_title: string | null;
  action_confirmed: boolean;
}

interface EntityMatchRow extends SnippetSource, ActionFields {
  entity_id: string;
  entity_name: string;
  screenshot_id: string;
  title: string;
  category: string;
  image_url: string;
}

interface SemanticMatchRow extends SnippetSource, ActionFields {
  id: string;
  title: string;
  category: string;
  image_url: string;
  similarity: number;
}

function buildSnippet(row: SnippetSource): string {
  const text = row.extracted_text?.trim();
  if (text) {
    return text.length > 140 ? `${text.slice(0, 140)}…` : text;
  }

  const firstDetail = Object.entries(row.key_details ?? {})[0];
  if (firstDetail) {
    const [key, value] = firstDetail;
    return `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`;
  }

  return "";
}

async function withSignedUrl(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  imageUrl: string
): Promise<string | null> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(imageUrl, 3600);
  return data?.signedUrl ?? null;
}

export async function POST(request: Request) {
  let query: string;
  try {
    const body = await request.json();
    query = typeof body?.query === "string" ? body.query.trim() : "";
  } catch {
    return NextResponse.json({ error: "Could not read the search request." }, { status: 400 });
  }

  if (!query) {
    return NextResponse.json({ error: "Type something to search for." }, { status: 400 });
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Search isn't configured yet. Add your Supabase keys to .env.local." },
      { status: 500 }
    );
  }

  // Relationship queries first — "everything from Rahul" should return every
  // screenshot linked to that entity, not just the one closest by embedding.
  // A missing/empty match falls straight through to semantic search below.
  const { data: entityMatches, error: entityError } = await withRetry(() =>
    supabase.rpc("find_entity_screenshots", { query_text: query })
  );

  if (entityError) {
    console.error("find_entity_screenshots failed:", {
      message: entityError.message,
      details: entityError.details,
      hint: entityError.hint,
      code: entityError.code,
    });
    // Non-fatal — fall through to semantic search rather than failing the
    // whole request over the entity-graph lookup.
  }

  const entityRows = (entityMatches ?? []) as EntityMatchRow[];

  if (entityRows.length > 0) {
    const results = await Promise.all(
      entityRows.map(async (row) => ({
        id: row.screenshot_id,
        title: row.title,
        category: row.category,
        snippet: buildSnippet(row),
        image_signed_url: await withSignedUrl(supabase, row.image_url),
        is_actionable: row.is_actionable,
        action_date: row.action_date,
        action_title: row.action_title,
        action_confirmed: row.action_confirmed,
      }))
    );

    return NextResponse.json({
      mode: "entity",
      entityName: entityRows[0].entity_name,
      results,
      isDatabaseEmpty: false,
    });
  }

  const { count, error: countError } = await withRetry(() =>
    supabase.from("screenshots").select("id", { count: "exact", head: true })
  );

  if (countError) {
    console.error("Supabase count failed:", {
      message: countError.message,
      details: countError.details,
      hint: countError.hint,
      code: countError.code,
    });
    return NextResponse.json({ error: "Couldn't reach the database." }, { status: 500 });
  }

  if (!count) {
    return NextResponse.json({ mode: "semantic", results: [], isDatabaseEmpty: true });
  }

  let queryEmbedding: number[];
  try {
    queryEmbedding = await embedText(query, "RETRIEVAL_QUERY");
  } catch (err) {
    console.error("Query embedding failed:", err);
    return NextResponse.json(
      { error: "The AI couldn't process that search. Please try again." },
      { status: 502 }
    );
  }

  const { data: matches, error: matchError } = await withRetry(() =>
    supabase.rpc("match_screenshots", {
      query_embedding: queryEmbedding,
      match_count: MATCH_COUNT,
    })
  );

  if (matchError) {
    console.error("Supabase match_screenshots failed:", {
      message: matchError.message,
      details: matchError.details,
      hint: matchError.hint,
      code: matchError.code,
    });
    const missingFn = /function .* does not exist/i.test(matchError.message ?? "");
    return NextResponse.json(
      {
        error: missingFn
          ? "The search function isn't set up yet. Run supabase/schema.sql, then try again."
          : "Search failed. Please try again.",
      },
      { status: 500 }
    );
  }

  const rows = (matches ?? []) as SemanticMatchRow[];

  const results = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      snippet: buildSnippet(row),
      image_signed_url: await withSignedUrl(supabase, row.image_url),
      is_actionable: row.is_actionable,
      action_date: row.action_date,
      action_title: row.action_title,
      action_confirmed: row.action_confirmed,
    }))
  );

  return NextResponse.json({ mode: "semantic", results, isDatabaseEmpty: false });
}

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { embedText } from "@/lib/gemini";

export const runtime = "nodejs";

const BUCKET = "screenshots";
const MATCH_COUNT = 5;

interface MatchRow {
  id: string;
  title: string;
  category: string;
  extracted_text: string;
  key_details: Record<string, unknown>;
  image_url: string;
  similarity: number;
}

function buildSnippet(row: MatchRow): string {
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

  const { count, error: countError } = await supabase
    .from("screenshots")
    .select("id", { count: "exact", head: true });

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
    return NextResponse.json({ results: [], isDatabaseEmpty: true });
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

  const { data: matches, error: matchError } = await supabase.rpc("match_screenshots", {
    query_embedding: queryEmbedding,
    match_count: MATCH_COUNT,
  });

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

  const rows = (matches ?? []) as MatchRow[];

  const results = await Promise.all(
    rows.map(async (row) => {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(row.image_url, 3600);

      return {
        id: row.id,
        title: row.title,
        category: row.category,
        snippet: buildSnippet(row),
        image_signed_url: signed?.signedUrl ?? null,
      };
    })
  );

  return NextResponse.json({ results, isDatabaseEmpty: false });
}

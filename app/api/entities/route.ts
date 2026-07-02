import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { withRetry } from "@/lib/with-retry";

export const runtime = "nodejs";

interface EntityRow {
  id: string;
  name: string;
  type: string;
  screenshot_count: number;
}

export async function GET() {
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

  const { data, error } = await withRetry(() => supabase.rpc("list_entities_with_counts"));

  if (error) {
    console.error("list_entities_with_counts failed:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    const missingFn = /function .* does not exist/i.test(error.message ?? "");
    return NextResponse.json(
      {
        error: missingFn
          ? "The entity graph isn't set up yet. Run supabase/schema.sql, then try again."
          : "Couldn't load entities. Please try again.",
      },
      { status: 500 }
    );
  }

  const entities = (data ?? []) as EntityRow[];

  return NextResponse.json({
    entities: entities.map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      count: e.screenshot_count,
    })),
  });
}

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-server";
import { buildIcsFile } from "@/lib/ics";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  let id: string;
  try {
    const body = await request.json();
    id = typeof body?.id === "string" ? body.id : "";
  } catch {
    return NextResponse.json({ error: "Could not read the request." }, { status: 400 });
  }

  if (!id) {
    return NextResponse.json({ error: "Missing screenshot id." }, { status: 400 });
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Not configured yet. Add your Supabase keys to .env.local." },
      { status: 500 }
    );
  }

  const { data: row, error: fetchError } = await supabase
    .from("screenshots")
    .select("id, is_actionable, action_title, action_date, action_location, reminder_minutes_before")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !row) {
    console.error("Fetch for confirm-action failed:", fetchError);
    return NextResponse.json({ error: "Screenshot not found." }, { status: 404 });
  }

  if (!row.is_actionable || !row.action_date || !row.action_title) {
    return NextResponse.json(
      { error: "This screenshot doesn't have a calendar action." },
      { status: 400 }
    );
  }

  const ics = buildIcsFile({
    uid: row.id,
    title: row.action_title,
    date: row.action_date,
    location: row.action_location,
    reminderMinutesBefore: row.reminder_minutes_before,
  });

  const { error: updateError } = await supabase
    .from("screenshots")
    .update({ action_confirmed: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Failed to mark action confirmed:", updateError);
    // Non-fatal for the download itself — the file is still generated
    // correctly, it just might show "Add to Calendar" again on revisit.
  }

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="event.ics"',
    },
  });
}

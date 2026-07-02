import "server-only";

export const SCREENSHOT_CATEGORIES = [
  "Shopping",
  "Travel",
  "Finance",
  "Medical",
  "Education",
  "Chat",
  "Social Media",
  "Coding",
  "Other",
] as const;

export type ScreenshotCategory = (typeof SCREENSHOT_CATEGORIES)[number];

export const ENTITY_TYPES = ["person", "product", "place", "organization", "other"] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export interface ScreenshotEntity {
  name: string;
  type: EntityType;
}

export interface ScreenshotAnalysis {
  title: string;
  category: ScreenshotCategory;
  extracted_text: string;
  key_details: Record<string, unknown>;
  entities: ScreenshotEntity[];
  is_actionable: boolean;
  action_date: string | null;
  action_title: string | null;
  action_location: string | null;
  reminder_minutes_before: number | null;
}

const EXAMPLE_OUTPUT = {
  title: "Flight to San Francisco",
  category: "Travel",
  extracted_text: "Air India AI-101 DEL -> SFO Depart Nov 14, 08:20 Seat 14C Booking ref XJ4K9P",
  key_details: {
    flight_number: "AI-101",
    departure: "DEL",
    arrival: "SFO",
    date: "2026-11-14",
    seat: "14C",
  },
  entities: [
    { name: "Air India", type: "organization" },
    { name: "San Francisco", type: "place" },
    { name: "Delhi", type: "place" },
  ],
  is_actionable: true,
  action_date: "2026-11-14T08:20:00",
  action_title: "Flight to San Francisco",
  action_location: "Delhi Airport",
  reminder_minutes_before: 120,
};

function buildPrompt(): string {
  return `You read a single screenshot and describe what is in it as JSON.

Return ONLY a JSON object with exactly these fields:
- "title": a short, human-readable title for what this screenshot is (max 8 words).
- "category": exactly one of ${SCREENSHOT_CATEGORIES.map((c) => `"${c}"`).join(", ")}.
- "extracted_text": the raw text visible in the image, transcribed as plainly as possible.
- "key_details": an object of whatever specific fields are relevant to this category.
  Do not force a fixed set of keys — include only what is actually present.
  Examples: a Shopping screenshot might have "price", "brand", "store";
  a Travel screenshot might have "flight_number", "date", "departure", "arrival".
- "entities": an array of objects for the specific named people, products, places, or
  organizations that are the actual subject of this screenshot — the handful of
  keywords someone would search for later to find it again. Each object has "name"
  (short, no descriptions) and "type" (exactly one of ${ENTITY_TYPES.map((t) => `"${t}"`).join(", ")}).
  Prioritize quality over quantity: usually 1-4 entities, ranked by how central they
  are to the content (most important first). Use the same name consistently if the
  same entity would plausibly recur across other screenshots (e.g. always "Rahul",
  not "Rahul" in one place and "Rahul K." in another).
  Do NOT include the app or platform the screenshot happens to be taken in or of
  (e.g. skip "WhatsApp", "Instagram", "YouTube", "Gmail", "Chrome") unless that
  company is genuinely what the screenshot is about (a receipt from Google, a
  review of a YouTube channel itself). A UI chrome label is not a keyword worth
  connecting screenshots by; a person's name, a specific product, a specific place,
  or a specific business is.
- "is_actionable": true only if this screenshot represents something with a specific
  date/time a person would realistically want to be reminded about — a flight, train,
  event ticket, appointment, bill due date, hotel booking, exam, deadline. false for
  things like a chat, a product listing with no date, a recipe, or anything without a
  concrete date attached.
- "action_date": required if is_actionable is true, otherwise null. An ISO 8601 date
  ("YYYY-MM-DD") if only a date is known, or an ISO 8601 datetime with no timezone
  offset ("YYYY-MM-DDTHH:MM:SS") if a specific time is known too.
- "action_title": required if is_actionable is true, otherwise null. A short human
  label for the event, e.g. "Flight to Bangalore" or "Electricity bill due".
- "action_location": optional even when is_actionable is true — null unless a
  specific, useful location is visible (airport, venue, address).
- "reminder_minutes_before": required if is_actionable is true, otherwise null. Your
  best estimate, in minutes, of how long before the event a reminder would actually
  be useful — e.g. 120 for a flight (time to get to the airport), 45 for a train, 60
  for a general appointment or deadline. Default to 60 if you have no better estimate.

If a field has no value, use an empty string, empty object, empty array, or null (per
the field's description above) — never omit a field and never invent information
that is not visibly present.

Example of the expected shape, for a different screenshot than the one you are given:
${JSON.stringify(EXAMPLE_OUTPUT, null, 2)}

Now analyze the attached screenshot and return JSON in exactly that shape.`;
}

export async function analyzeScreenshot(
  base64Image: string,
  mimeType: string
): Promise<ScreenshotAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: buildPrompt() },
              { inlineData: { mimeType, data: base64Image } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Gemini request failed (${response.status}): ${errorBody.slice(0, 300)}`);
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];

  if (candidate?.finishReason === "SAFETY") {
    throw new Error("Gemini declined to analyze this image.");
  }

  const text: string | undefined = candidate?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("");

  if (!text) {
    throw new Error("Gemini returned no content for this image.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini did not return valid JSON.");
  }

  return normalizeAnalysis(parsed);
}

function normalizeAnalysis(raw: unknown): ScreenshotAnalysis {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const category = SCREENSHOT_CATEGORIES.includes(obj.category as ScreenshotCategory)
    ? (obj.category as ScreenshotCategory)
    : "Other";

  const title =
    typeof obj.title === "string" && obj.title.trim().length > 0
      ? obj.title.trim()
      : "Untitled screenshot";

  const extracted_text = typeof obj.extracted_text === "string" ? obj.extracted_text : "";

  const key_details =
    obj.key_details && typeof obj.key_details === "object" && !Array.isArray(obj.key_details)
      ? (obj.key_details as Record<string, unknown>)
      : {};

  const entities = normalizeEntities(obj.entities);

  const {
    is_actionable,
    action_date,
    action_title,
    action_location,
    reminder_minutes_before,
  } = normalizeAction(obj);

  return {
    title,
    category,
    extracted_text,
    key_details,
    entities,
    is_actionable,
    action_date,
    action_title,
    action_location,
    reminder_minutes_before,
  };
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/;

function normalizeAction(obj: Record<string, unknown>): Pick<
  ScreenshotAnalysis,
  "is_actionable" | "action_date" | "action_title" | "action_location" | "reminder_minutes_before"
> {
  const rawDate = typeof obj.action_date === "string" ? obj.action_date.trim() : "";
  const rawTitle = typeof obj.action_title === "string" ? obj.action_title.trim() : "";
  const rawLocation = typeof obj.action_location === "string" ? obj.action_location.trim() : "";
  const rawReminder =
    typeof obj.reminder_minutes_before === "number" ? obj.reminder_minutes_before : NaN;

  // Only trust is_actionable if there's actually a usable date and title to
  // back it up — a screenshot flagged actionable with no date isn't
  // something we can build a calendar event from.
  const is_actionable = obj.is_actionable === true && ISO_DATE_RE.test(rawDate) && rawTitle.length > 0;

  if (!is_actionable) {
    return {
      is_actionable: false,
      action_date: null,
      action_title: null,
      action_location: null,
      reminder_minutes_before: null,
    };
  }

  const reminder_minutes_before = Number.isFinite(rawReminder)
    ? Math.min(1440, Math.max(10, Math.round(rawReminder)))
    : 60;

  return {
    is_actionable: true,
    action_date: rawDate,
    action_title: rawTitle,
    action_location: rawLocation || null,
    reminder_minutes_before,
  };
}

function normalizeEntities(raw: unknown): ScreenshotEntity[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const entities: ScreenshotEntity[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const entry = item as Record<string, unknown>;
    const name = typeof entry.name === "string" ? entry.name.trim() : "";
    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const type = ENTITY_TYPES.includes(entry.type as EntityType)
      ? (entry.type as EntityType)
      : "other";

    entities.push({ name, type });
  }

  return entities;
}

// Matches the `vector(768)` column in supabase/schema.sql. If
// GEMINI_EMBEDDING_MODEL is changed to a model with a different output
// size, update both places.
export const EMBEDDING_DIMENSIONS = 768;

type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

export async function embedText(
  text: string,
  taskType: EmbeddingTaskType
): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  const model = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${model}`,
        content: { parts: [{ text }] },
        taskType,
        outputDimensionality: EMBEDDING_DIMENSIONS,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Gemini embedding request failed (${response.status}): ${errorBody.slice(0, 300)}`
    );
  }

  const data = await response.json();
  const values = data?.embedding?.values;

  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Gemini returned no embedding values.");
  }

  return values as number[];
}

export function buildEmbeddingSource(
  analysis: Pick<ScreenshotAnalysis, "title" | "extracted_text" | "key_details" | "entities">
): string {
  const detailLines = Object.entries(analysis.key_details)
    .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join("\n");

  const entityLine = analysis.entities.map((e) => e.name).join(", ");

  return [analysis.title, analysis.extracted_text, detailLines, entityLine]
    .filter((part) => part && part.trim().length > 0)
    .join("\n");
}

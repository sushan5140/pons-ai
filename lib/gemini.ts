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

export interface ScreenshotAnalysis {
  title: string;
  category: ScreenshotCategory;
  extracted_text: string;
  key_details: Record<string, unknown>;
  entities: string[];
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
  entities: ["Air India", "San Francisco", "Delhi"],
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
- "entities": an array of distinct named people, products, places, or organizations
  mentioned or shown in the screenshot. Use short plain strings, no descriptions.

If a field has no value, use an empty string, empty object, or empty array —
never omit a field and never invent information that is not visibly present.

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

  const entities = Array.isArray(obj.entities)
    ? obj.entities.filter((e): e is string => typeof e === "string")
    : [];

  return { title, category, extracted_text, key_details, entities };
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
  analysis: Pick<ScreenshotAnalysis, "title" | "extracted_text" | "key_details">
): string {
  const detailLines = Object.entries(analysis.key_details)
    .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join("\n");

  return [analysis.title, analysis.extracted_text, detailLines]
    .filter((part) => part && part.trim().length > 0)
    .join("\n");
}

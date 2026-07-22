import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  destination: z.string().min(1),
  days: z.number().int().min(1).max(30),
  budget: z.number().positive(),
  travelStyle: z.string().min(1),
});

export type GenerateTripInput = z.infer<typeof InputSchema>;

export type GenerateTripResult = {
  tripSummary: string;
  days: Array<{
    day: number;
    morning: string;
    afternoon: string;
    evening: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    transport: string;
    estimatedCost: string;
    tip: string;
    attractions?: Array<{
      name: string;
      lat: number;
      lng: number;
      description?: string;
      photoTip?: string;
      travelTime?: string;
      waitTime?: string;
      alternative?: string;
    }>;
  }>;
  packing: string[];
  budget: {
    hotel: string;
    food: string;
    transport: string;
    activities: string;
    total: string;
  };
  festivals?: string;
};

const responseSchema = {
  type: "OBJECT",
  properties: {
    tripSummary: { type: "STRING" },
    days: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          day: { type: "INTEGER" },
          morning: { type: "STRING" },
          afternoon: { type: "STRING" },
          evening: { type: "STRING" },
          breakfast: { type: "STRING" },
          lunch: { type: "STRING" },
          dinner: { type: "STRING" },
          transport: { type: "STRING" },
          estimatedCost: { type: "STRING" },
          tip: { type: "STRING" },
          attractions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                lat: { type: "NUMBER" },
                lng: { type: "NUMBER" },
                description: { type: "STRING" },
                photoTip: { type: "STRING" },
                travelTime: { type: "STRING" },
                waitTime: { type: "STRING" },
                alternative: { type: "STRING" },
              },
              required: ["name", "lat", "lng"],
            },
          },
        },
        required: ["day", "morning", "afternoon", "evening", "breakfast", "lunch", "dinner", "transport", "estimatedCost", "tip"],
      },
    },
    packing: { type: "ARRAY", items: { type: "STRING" } },
    budget: {
      type: "OBJECT",
      properties: {
        hotel: { type: "STRING" },
        food: { type: "STRING" },
        transport: { type: "STRING" },
        activities: { type: "STRING" },
        total: { type: "STRING" },
      },
      required: ["hotel", "food", "transport", "activities", "total"],
    },
    festivals: { type: "STRING" },
  },
  required: ["tripSummary", "days", "packing", "budget"],
};

export const generateTripFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<GenerateTripResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const { destination, days, budget, travelStyle } = data;
    const totalBudget = budget * days;

    const prompt = `You are a seasoned local guide and India travel planner. Craft a detailed, authentic ${days}-day itinerary for ${destination}, India.

Traveler:
- Style: ${travelStyle}
- Budget: ₹${budget}/day (₹${totalBudget} total)

Quality bar (very important):
- AVOID over-touristed traps and generic top-10 lists. Prefer places locals actually love.
- Weave in HIDDEN GEMS: quiet viewpoints, neighborhood temples, artisan lanes, family-run kitchens.
- Recommend LOCAL CAFES and independent coffee/chai spots by name.
- Use REALISTIC travel times between places (e.g. "20 min auto"), and estimate WAITING/queue times where relevant.
- Suggest a graceful ALTERNATIVE for each key attraction in case it's closed, crowded, or the weather turns.
- Point out the best PHOTOGRAPHY spots and the ideal time of day for them.
- Mention any LOCAL FESTIVALS, markets or seasonal events that overlap the trip (in the top-level "festivals" field), or a short note explaining none coincide.
- Space activities so days feel unhurried and human, not a checklist.

Structure:
- Exactly ${days} entries in "days", numbered 1..${days}.
- Each day: morning / afternoon / evening activities naming SPECIFIC places in ${destination}.
- Each day: authentic breakfast, lunch, dinner (dish + venue).
- Each day: realistic transport summary and estimatedCost as "₹4,500".
- Each day: one insider "tip" no guidebook would print.
- Each day: 2-4 "attractions" with real, accurate lat/lng coordinates within ${destination} (WGS84 decimal degrees). Include short description, photoTip, travelTime from the previous stop, expected waitTime, and an alternative option.
- "packing": 6-10 items tailored to ${destination} and ${travelStyle}.
- "budget": realistic split summing to ~₹${totalBudget} (hotel, food, transport, activities, total) as rupee strings.
- "tripSummary": 2-3 sentences capturing the vibe.
- "festivals": short paragraph on local festivals/events during typical travel windows, or "No major festivals during standard travel windows."

Return ONLY the JSON object with EXACTLY these top-level keys: "tripSummary", "days", "packing", "budget", "festivals". Each item in "days" MUST have flat string fields plus the "attractions" array. Do NOT nest breakfast/lunch/transport inside morning/afternoon/evening. No prose, no markdown.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.9,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("AI Gateway failed", res.status, body);
      if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
      throw new Error(`AI Gateway failed [${res.status}]`);
    }

    const json = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = json.choices?.[0]?.message?.content;
    if (!text) throw new Error("AI returned no content");

    const tryParse = (s: string): GenerateTripResult | null => {
      try { return JSON.parse(s) as GenerateTripResult; } catch { return null; }
    };
    let parsed = tryParse(text);
    if (!parsed) {
      const stripped = text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
      parsed = tryParse(stripped);
    }
    if (!parsed) {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end > start) parsed = tryParse(text.slice(start, end + 1));
    }
    if (!parsed) {
      console.error("AI returned invalid JSON:", text.slice(0, 500));
      throw new Error("AI returned invalid JSON");
    }
    return parsed;
  });

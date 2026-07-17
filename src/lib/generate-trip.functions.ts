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
  }>;
  packing: string[];
  budget: {
    hotel: string;
    food: string;
    transport: string;
    activities: string;
    total: string;
  };
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
  },
  required: ["tripSummary", "days", "packing", "budget"],
};

export const generateTripFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<GenerateTripResult> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const { destination, days, budget, travelStyle } = data;
    const totalBudget = budget * days;

    const prompt = `You are an expert India travel planner. Create a detailed, authentic ${days}-day itinerary for ${destination}, India.

Traveler preferences:
- Travel style: ${travelStyle}
- Budget: ₹${budget} per day (₹${totalBudget} total for ${days} days), in Indian Rupees

Requirements:
- Provide exactly ${days} day entries, numbered 1..${days}.
- For each day: morning, afternoon, and evening activities with specific place names in ${destination}.
- Recommend authentic local breakfast, lunch, and dinner dishes/venues.
- Suggest realistic transport for that day.
- Give an "estimatedCost" as a rupee string like "₹4,500".
- Include one insider local tip per day.
- "packing": 6-10 practical items tailored to ${destination} and ${travelStyle}.
- "budget": realistic split (hotel, food, transport, activities, total) as rupee strings that roughly sum to ₹${totalBudget}.
- "tripSummary": 2-3 sentences capturing the vibe of the trip.

Return ONLY the JSON matching the provided schema. No prose, no markdown.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.9,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Gemini API failed", res.status, body);
      throw new Error(`Gemini API failed [${res.status}]`);
    }

    const json = await res.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned no content");

    let parsed: GenerateTripResult;
    try {
      parsed = JSON.parse(text) as GenerateTripResult;
    } catch {
      throw new Error("Gemini returned invalid JSON");
    }
    return parsed;
  });

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
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

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

Return ONLY the JSON object, no prose, no markdown.`;

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

    try {
      return JSON.parse(text) as GenerateTripResult;
    } catch {
      throw new Error("AI returned invalid JSON");
    }
  });

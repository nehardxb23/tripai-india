export type TripInput = {
  destination: string;
  days: number;
  budget: number;
  style: string;
};

export type DayPlan = {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  transport: string;
  budget: string;
  tips: string;
};


export type Trip = {
  input: TripInput;
  days: DayPlan[];
  packing: string[];
  weather: string;
  budgetSummary: { label: string; amount: number }[];
};

const STORAGE_KEY = "tripai:current";

const STYLE_FLAVORS: Record<string, { morning: string; afternoon: string; evening: string }> = {
  Adventure: {
    morning: "Sunrise trek along a lesser-known ridge with a local guide.",
    afternoon: "River rafting or a hidden waterfall hike off the tourist trail.",
    evening: "Bonfire dinner under the stars with folk musicians.",
  },
  Cultural: {
    morning: "Private heritage walk through the old city with a historian.",
    afternoon: "Handloom workshop with an artisan family — try the loom yourself.",
    evening: "Classical dance performance in a candle-lit courtyard.",
  },
  Foodie: {
    morning: "Local breakfast crawl — poha, kachori, filter coffee.",
    afternoon: "Street food tour through the spice market with a chef.",
    evening: "Home-cooked thali dinner hosted by a local family.",
  },
  Relaxation: {
    morning: "Sunrise yoga overlooking the valley, followed by an Ayurvedic breakfast.",
    afternoon: "Traditional Abhyanga massage and unhurried lunch on a rooftop.",
    evening: "Sunset boat ride and a quiet dinner by the water.",
  },
  Luxury: {
    morning: "Private butler breakfast, then a chauffeured heritage tour.",
    afternoon: "Curated palace visit with a royal descendant as your host.",
    evening: "Multi-course tasting menu at an award-winning restaurant.",
  },
  Backpacker: {
    morning: "Cheap chai, walking tour, and a shared auto to the main sights.",
    afternoon: "Local bus to an off-map village and lunch at a dhaba.",
    evening: "Hostel rooftop hangout with travelers from around the world.",
  },
};

const BREAKFASTS = [
  "Masala dosa with filter coffee",
  "Poha and jalebi at a corner stall",
  "Aloo paratha with fresh curd",
  "Idli-vada with sambar",
  "Puri bhaji and masala chai",
  "Chole bhature with lassi",
];

const LUNCHES = [
  "Traditional thali at a family-run kitchen",
  "Hyderabadi biryani with mirchi ka salan",
  "Rajasthani dal baati churma",
  "Bengali fish curry with steamed rice",
  "Goan vindaloo with poi bread",
  "Kerala sadya on a banana leaf",
];

const DINNERS = [
  "Butter chicken with garlic naan",
  "Rogan josh with saffron pulao",
  "Rooftop tandoori platter under the stars",
  "Chettinad chicken with parotta",
  "Home-cooked kadhi chawal by a local host",
  "Malvani seafood spread by the beach",
];

const TIPS = [
  "Carry small denomination cash — many local stalls don't accept UPI from foreign cards.",
  "Dress modestly at temples; keep a scarf handy.",
  "Book train tickets 24 hours in advance for tatkal availability.",
  "Bargain politely at markets — start at 40% of the quoted price.",
  "Download offline Google Maps for the area before you head out.",
  "Try to travel between cities overnight to save a hotel night.",
];

const TRANSPORTS = ["Auto-rickshaw + metro", "Prepaid taxi", "Local train", "Rented scooter", "Private car with driver"];

export function generateTrip(input: TripInput): Trip {
  const flavor = STYLE_FLAVORS[input.style] ?? STYLE_FLAVORS.Cultural;
  const perDay = input.budget; // budget is per-day
  const total = perDay * input.days;

  const days: DayPlan[] = Array.from({ length: input.days }, (_, i) => ({
    day: i + 1,
    title: i === 0 ? `Arrive in ${input.destination}` : i === input.days - 1 ? `Farewell to ${input.destination}` : `Discover ${input.destination}`,
    morning: flavor.morning,
    afternoon: flavor.afternoon,
    evening: flavor.evening,
    breakfast: BREAKFASTS[i % BREAKFASTS.length],
    lunch: LUNCHES[i % LUNCHES.length],
    dinner: DINNERS[i % DINNERS.length],
    transport: TRANSPORTS[i % TRANSPORTS.length],
    budget: `₹${perDay.toLocaleString("en-IN")}`,
    tips: TIPS[i % TIPS.length],
  }));

  const packing = [
    "Lightweight cotton clothing",
    "Comfortable walking shoes",
    "Sunscreen & sunglasses",
    "Reusable water bottle",
    "Universal power adapter",
    "Basic medicine kit",
    "Scarf or shawl for temples",
    "Portable power bank",
  ];

  const weather = `${input.destination} is generally warm this season — expect 22–34°C. Pack light layers for early mornings and a light rain jacket if monsoon-adjacent.`;

  const budgetSummary = [
    { label: "Stay", amount: Math.round(total * 0.4) },
    { label: "Food", amount: Math.round(total * 0.2) },
    { label: "Transport", amount: Math.round(total * 0.2) },
    { label: "Experiences", amount: Math.round(total * 0.15) },
    { label: "Buffer", amount: Math.round(total * 0.05) },
  ];

  return { input, days, packing, weather, budgetSummary };
}


export function saveTrip(trip: Trip) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
}

export function loadTrip(): Trip | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as Trip; } catch { return null; }
}

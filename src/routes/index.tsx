import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Sparkles, MapPin, Wallet, Utensils, Gem, Users, Wand2, ArrowRight, Plane, Compass, Palmtree, Mountain, Camera, Globe2, Map, Download, Save } from "lucide-react";
import heroImg from "@/assets/hero-india.jpg";
import { Nav } from "@/components/Nav";
import { tripFromApi, saveTrip } from "@/lib/trip-store";
import { generateTripFn } from "@/lib/generate-trip.functions";

export const Route = createFileRoute("/")({
  component: Landing,
});


const STYLES = ["Adventure", "Cultural", "Foodie", "Relaxation", "Luxury", "Backpacker"];

const FEATURES = [
  { icon: Gem, title: "Hidden Gems", desc: "Off-the-map spots locals actually love — not the top-10 lists." },
  { icon: Wallet, title: "Budget Planning", desc: "A clear breakdown of stay, food, transport and experiences." },
  { icon: Utensils, title: "Food Recommendations", desc: "Regional dishes and the exact stalls to try them at." },
  { icon: Users, title: "Local Experiences", desc: "Workshops, home-cooked meals and neighborhood walks." },
  { icon: Sparkles, title: "AI Powered", desc: "Itineraries tailored to your days, budget and travel style." },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    icon: MapPin,
    title: "Choose Your Destination",
    desc: "Enter your destination, number of travel days, budget per day, and travel style.",
    gradient: "from-primary/10 via-primary/5 to-transparent",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "AI Creates Your Itinerary",
    desc: "Our AI generates a personalized day-by-day travel plan with attractions, local experiences, food recommendations, transport, and estimated costs.",
    gradient: "from-accent/10 via-accent/5 to-transparent",
  },
  {
    step: "03",
    icon: Map,
    title: "Explore Interactive Travel Plans",
    desc: "View your itinerary on an interactive map with routes, destination images, budget breakdown, packing checklist, and weather tips.",
    gradient: "from-primary/10 via-primary/5 to-transparent",
  },
  {
    step: "04",
    icon: Plane,
    title: "Save & Travel",
    desc: "Download your itinerary as a PDF, save your trip, or generate a new itinerary anytime.",
    gradient: "from-accent/10 via-accent/5 to-transparent",
  },
];

function Landing() {
  const navigate = useNavigate();
  const callGenerate = useServerFn(generateTripFn);
  const [destination, setDestination] = useState("Jaipur");
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(5000);
  const [style, setStyle] = useState("Cultural");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const input = { destination: destination.trim(), days, budget, style };
      const api = await callGenerate({
        data: { destination: input.destination, days, budget, travelStyle: style },
      });
      const trip = tripFromApi(input, api);
      saveTrip(trip);
      navigate({ to: "/itinerary" });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to generate itinerary");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative">
      {loading && <LoadingOverlay destination={destination} />}
      <Nav />

      {/* Hero */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        {/* Floating travel icons */}
        <FloatingIcon icon={Plane} className="top-24 left-[8%] text-primary/60" delay="0s" />
        <FloatingIcon icon={Palmtree} className="top-48 left-[4%] text-accent/70" delay="1.2s" />
        <FloatingIcon icon={Mountain} className="bottom-16 left-[10%] text-primary/50" delay="2.4s" />
        <FloatingIcon icon={Camera} className="top-32 right-[6%] text-accent/60 hidden lg:block" delay="0.8s" />
        <FloatingIcon icon={Globe2} className="bottom-24 right-[8%] text-primary/50 hidden lg:block" delay="1.8s" />
        <FloatingIcon icon={Compass} className="top-72 right-[14%] text-primary/40 hidden lg:block" delay="3s" />

        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-14 items-center relative">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI itineraries, crafted like a local
            </div>
            <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground">
              Explore India <br />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">Like a Local</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Generate personalized AI travel itineraries in seconds — with hidden gems, food, budget and everything in between.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a href="#plan" className="btn-primary-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold">
                Plan my trip <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#features" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                See what's inside →
              </a>
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 via-primary-glow/20 to-accent/30 rounded-[2.5rem] blur-2xl" />
            <img
              src={heroImg}
              width={1600}
              height={1200}
              alt="Taj Mahal at sunrise with marigolds"
              className="relative rounded-[2rem] shadow-[var(--shadow-elevated)] w-full h-[420px] md:h-[520px] object-cover"
            />
            <div className="absolute -bottom-6 -left-6 glass-card p-4 flex items-center gap-3 max-w-[220px]">
              <span className="grid place-items-center h-10 w-10 rounded-full bg-accent/20">
                <MapPin className="h-5 w-5 text-accent-foreground" />
              </span>
              <div>
                <div className="text-xs text-muted-foreground">Trips planned</div>
                <div className="font-display font-bold text-lg">42,300+</div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 glass-card p-3 hidden md:flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">AI Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="plan" className="pb-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <form onSubmit={onGenerate} className="card-soft p-6 md:p-10 animate-fade-in-up">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Destination">
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Jaipur, Kerala, Ladakh"
                  className="input"
                />
              </Field>
              <Field label="Days">
                <input
                  type="number" min={1} max={30}
                  value={days}
                  onChange={(e) => setDays(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                  className="input"
                />
              </Field>
              <Field label="Budget per day (₹)">
                <input
                  type="number" min={500} step={250}
                  value={budget}
                  onChange={(e) => setBudget(Math.max(500, Number(e.target.value) || 0))}
                  className="input"
                />
              </Field>
              <Field label="Travel style">
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <button
                      type="button" key={s}
                      onClick={() => setStyle(s)}
                      className={`rounded-full px-4 py-2 text-sm font-medium border transition-all ${
                        style === s
                          ? "bg-foreground text-background border-foreground"
                          : "bg-surface text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </Field>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-gradient mt-8 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold disabled:opacity-70"
            >
              {loading ? (
                <><Wand2 className="h-5 w-5 animate-pulse" /> Crafting your journey…</>
              ) : (
                <><Sparkles className="h-5 w-5" /> Plan My Trip</>
              )}
            </button>
            {error && (
              <p className="mt-4 text-sm text-center text-red-600">{error}</p>
            )}
          </form>

        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="pb-28 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              <Compass className="h-3.5 w-3.5 text-primary" />
              Simple & seamless
            </div>
            <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
              How TripAI India works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Four steps from inspiration to itinerary.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((s, i) => (
              <div
                key={s.step}
                className="group relative glass-card card-soft-hover p-7 md:p-8 rounded-[2rem] overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
                  aria-hidden="true"
                />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <span className="grid place-items-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary shadow-soft">
                      <s.icon className="h-7 w-7" strokeWidth={2} />
                    </span>
                    <span className="font-display font-bold text-3xl text-muted-foreground/30">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-3">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl mb-14">
            <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
              Everything a great trip needs.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Five things we obsess over, so you don't have to.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-soft card-soft-hover p-8">
                <span className="grid place-items-center h-12 w-12 rounded-2xl bg-primary/10 text-primary mb-5">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="font-display font-semibold text-xl mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 text-sm text-muted-foreground flex flex-wrap justify-between gap-4">
          <span>© {new Date().getFullYear()} TripAI India</span>
          <span>Crafted for curious travelers.</span>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function FloatingIcon({ icon: Icon, className, delay }: { icon: React.ElementType; className?: string; delay?: string }) {
  return (
    <div
      className={`absolute pointer-events-none animate-float ${className ?? ""}`}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      <div className="grid place-items-center h-12 w-12 rounded-2xl glass-card">
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
    </div>
  );
}

function LoadingOverlay({ destination }: { destination: string }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/80 backdrop-blur-xl animate-fade-in">
      <div className="text-center px-6 max-w-md">
        <div className="relative grid place-items-center mx-auto h-24 w-24 mb-8">
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-primary/30" />
          <span className="relative grid place-items-center h-16 w-16 rounded-full btn-primary-gradient animate-spin-slow">
            <Compass className="h-8 w-8" strokeWidth={2.5} />
          </span>
        </div>
        <h2 className="font-display font-bold text-2xl md:text-3xl mb-3 tracking-tight">
          Crafting your journey to {destination || "India"}
        </h2>
        <p className="text-muted-foreground mb-8">
          Our AI is picking hidden gems, local food and the perfect day-by-day flow…
        </p>
        <div className="space-y-3 text-left">
          {["Finding hidden gems", "Planning meals", "Balancing your budget"].map((s, i) => (
            <div key={s} className="glass-card p-4 flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 200}ms` }}>
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-primary to-primary-glow animate-pulse" />
              <span className="text-sm font-medium">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

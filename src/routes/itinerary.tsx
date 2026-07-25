import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Sunrise, Sun, Moon, Coffee, UtensilsCrossed, ChefHat, Car, Wallet, Lightbulb,
  Download, Bookmark, Check, ArrowLeft, CloudSun, Package, Sparkles, MapPin,
  Map as MapIcon, PartyPopper, Camera, Clock, Compass
} from "lucide-react";
import jsPDF from "jspdf";
import { Nav } from "@/components/Nav";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { AnalyticsCards } from "@/components/AnalyticsCards";
import { loadTrip, type Trip, type DayPlan, type Attraction } from "@/lib/trip-store";

// Leaflet touches window at import time — lazy-load behind ClientOnly.
const TripMap = lazy(() => import("@/components/TripMap"));

export const Route = createFileRoute("/itinerary")({
  head: () => ({
    meta: [
      { title: "Your itinerary — TripAI India" },
      { name: "description", content: "Your personalized AI-generated India travel itinerary." },
    ],
  }),
  component: Itinerary,
});

function Itinerary() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = loadTrip();
    if (!t) navigate({ to: "/" });
    else setTrip(t);
    setReady(true);
  }, [navigate]);

  if (!ready) return <ItinerarySkeleton />;
  if (!trip) return <ItinerarySkeleton />;

  const total = trip.budgetSummary.reduce((s, i) => s + i.amount, 0);

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    let y = margin;
    const line = (t: string, size = 11, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(t, 500);
      lines.forEach((l: string) => {
        if (y > 780) { doc.addPage(); y = margin; }
        doc.text(l, margin, y); y += size + 4;
      });
    };
    line(`TripAI India — ${trip.input.destination}`, 20, true);
    line(`${trip.input.days} days · ₹${trip.input.budget.toLocaleString("en-IN")} · ${trip.input.style}`, 11);
    y += 8;
    trip.days.forEach((d) => {
      line(`Day ${d.day} — ${d.title}`, 14, true);
      line(`Morning: ${d.morning}`);
      line(`Afternoon: ${d.afternoon}`);
      line(`Evening: ${d.evening}`);
      line(`Breakfast: ${d.breakfast}`);
      line(`Lunch: ${d.lunch}`);
      line(`Dinner: ${d.dinner}`);
      line(`Transport: ${d.transport}`);
      line(`Budget: ${d.budget}`);
      line(`Tip: ${d.tips}`);
      y += 8;
    });
    doc.save(`tripai-${trip.input.destination.toLowerCase()}.pdf`);
  };

  

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          {/* Photo carousel */}
          <div className="mb-8 animate-fade-in">
            <PhotoCarousel destination={trip.input.destination} />
          </div>

          <header className="flex flex-wrap items-end justify-between gap-6 mb-8 animate-fade-in-up">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Your itinerary</div>
              <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight">{trip.input.destination}</h1>
              <p className="mt-3 text-muted-foreground text-lg">
                {trip.input.days} days · ₹{trip.input.budget.toLocaleString("en-IN")}/day · {trip.input.style}
              </p>
            </div>
          </header>

          {/* Analytics */}
          <div className="mb-8 animate-fade-in-up">
            <AnalyticsCards items={trip.budgetSummary} />
          </div>

          {/* Interactive map */}
          <section className="mb-10 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <MapIcon className="h-5 w-5 text-primary" />
              <h2 className="font-display font-bold text-2xl tracking-tight">Trip map</h2>
              <span className="text-sm text-muted-foreground ml-2">Markers, routes & popup notes</span>
            </div>
            <div className="card-soft overflow-hidden p-0 h-[420px]">
              <ClientOnly
                fallback={
                  <div className="skeleton h-full w-full" />
                }
              >
                <Suspense fallback={<div className="skeleton h-full w-full" />}>
                  <TripMap days={trip.days} />
                </Suspense>
              </ClientOnly>
            </div>
          </section>

          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            {/* Timeline */}
            <div className="relative">
              {trip.days.length === 0 && (
                <div className="card-soft p-10 text-center text-muted-foreground">No itinerary generated.</div>
              )}
              {trip.days.length > 0 && (
                <div className="relative pl-6 md:pl-10">
                  {/* Vertical line */}
                  <div className="absolute left-2 md:left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary via-primary-glow to-accent/60" />
                  <div className="space-y-10">
                    {trip.days.map((d, i) => (
                      <TimelineDay key={d.day} day={d} index={i} isToday={i === 0} />
                    ))}
                  </div>
                </div>
              )}
            </div>



            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-24 self-start">
              <div className="card-soft p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-semibold text-lg">Budget summary</h3>
                </div>
                <div className="space-y-3">
                  {trip.budgetSummary.map((b) => {
                    const pct = (b.amount / total) * 100;
                    return (
                      <div key={b.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{b.label}</span>
                          <span className="font-semibold">₹{b.amount.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between font-display font-bold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="card-soft p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-semibold text-lg">Packing checklist</h3>
                </div>
                <ul className="space-y-2">
                  {trip.packing.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-soft p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CloudSun className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-semibold text-lg">Weather tips</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{trip.weather}</p>
              </div>

              {trip.festivals && (
                <div className="card-soft p-6 bg-gradient-to-br from-accent/10 to-transparent">
                  <div className="flex items-center gap-2 mb-3">
                    <PartyPopper className="h-5 w-5 text-accent-foreground" />
                    <h3 className="font-display font-semibold text-lg">Local festivals</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{trip.festivals}</p>
                </div>
              )}

              <div className="space-y-3">
                <button onClick={downloadPDF} className="btn-primary-gradient w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold">
                  <Download className="h-4 w-4" /> Download PDF
                </button>
                <button onClick={save} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold border border-border bg-surface hover:border-foreground/40 transition-colors">
                  {saved ? <><Check className="h-4 w-4 text-accent" /> Saved!</> : <><Bookmark className="h-4 w-4" /> Save Trip</>}
                </button>
                <Link to="/" className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold border border-border bg-surface hover:border-foreground/40 transition-colors">
                  <Sparkles className="h-4 w-4" /> Generate Again
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineDay({ day, index, isToday }: { day: DayPlan; index: number; isToday: boolean }) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className={`relative transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {/* Timeline node */}
      <div className="absolute -left-6 md:-left-10 top-6 flex items-center justify-center">
        <span className="relative grid place-items-center h-10 w-10 rounded-full btn-primary-gradient font-display font-bold text-sm ring-4 ring-background">
          {day.day}
          {isToday && (
            <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
          )}
        </span>
      </div>

      <div
        className={`card-soft card-soft-hover p-6 md:p-8 ml-4 md:ml-6 ${
          isToday
            ? "ring-2 ring-primary/40 shadow-[var(--shadow-glow)] bg-gradient-to-br from-primary/5 via-surface to-accent/5"
            : ""
        }`}
      >
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-1">
              <MapPin className="h-3.5 w-3.5" /> Day {day.day}
              {isToday && (
                <span className="ml-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold tracking-wide normal-case">
                  Today
                </span>
              )}
            </div>
            <h2 className="font-display font-semibold text-2xl md:text-3xl tracking-tight truncate">
              {day.title}
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full glass-card px-3 py-1.5 text-xs font-semibold text-primary">
            <Wallet className="h-3.5 w-3.5" /> {day.budget}
          </div>
        </div>

        {/* Time-of-day slots */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <SlotCard emoji="🌅" icon={Sunrise} label="Morning" text={day.morning} gradient="from-amber-200/50 to-orange-100/30" iconColor="text-amber-600" />
          <SlotCard emoji="🌞" icon={Sun} label="Afternoon" text={day.afternoon} gradient="from-orange-200/50 to-rose-100/30" iconColor="text-orange-600" />
          <SlotCard emoji="🌇" icon={Moon} label="Evening" text={day.evening} gradient="from-indigo-200/50 to-violet-100/30" iconColor="text-indigo-600" />
        </div>

        {/* Attractions */}
        {day.attractions.length > 0 && (
          <div className="mb-4 rounded-2xl border border-border/60 bg-surface/60 p-4">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Compass className="h-3.5 w-3.5 text-primary" /> Places on this day
            </div>
            <ul className="space-y-3">
              {day.attractions.map((a, i) => (
                <AttractionRow key={`${a.name}-${i}`} a={a} n={i + 1} />
              ))}
            </ul>
          </div>
        )}

        {/* Meals */}
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <MealRow emoji="🍳" icon={Coffee} label="Breakfast" value={day.breakfast} />
          <MealRow emoji="🍛" icon={UtensilsCrossed} label="Lunch" value={day.lunch} />
          <MealRow emoji="🍽" icon={ChefHat} label="Dinner" value={day.dinner} />
        </div>

        {/* Meta */}
        <div className="grid sm:grid-cols-3 gap-3 pt-4 border-t border-border">
          <MetaTile emoji="🚕" icon={Car} label="Transport" value={day.transport} />
          <MetaTile emoji="💰" icon={Wallet} label="Estimated cost" value={day.budget} />
          <MetaTile emoji="💡" icon={Lightbulb} label="Local tip" value={day.tips} accent />
        </div>
      </div>
    </article>
  );
}

function SlotCard({ emoji, icon: Icon, label, text, gradient, iconColor }: { emoji: string; icon: React.ElementType; label: string; text: string; gradient: string; iconColor: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border/60 p-4 bg-gradient-to-br ${gradient}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg leading-none" aria-hidden="true">{emoji}</span>
        <div className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${iconColor}`}>
          <Icon className="h-3.5 w-3.5" /> {label}
        </div>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function MealRow({ emoji, icon: Icon, label, value }: { emoji: string; icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl p-3 bg-surface/60 border border-border/50">
      <span className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 shrink-0 text-base" aria-hidden="true">
        {emoji}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon className="h-3 w-3" /> {label}
        </div>
        <div className="text-sm font-medium text-foreground leading-snug">{value}</div>
      </div>
    </div>
  );
}

function MetaTile({ emoji, icon: Icon, label, value, accent }: { emoji: string; icon: React.ElementType; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`grid place-items-center h-10 w-10 rounded-xl shrink-0 text-base ${
          accent ? "bg-accent/15" : "bg-muted"
        }`}
        aria-hidden="true"
      >
        {emoji}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon className="h-3 w-3" /> {label}
        </div>
        <div className="text-sm font-medium text-foreground leading-snug">{value}</div>
      </div>
    </div>
  );
}

function ItinerarySkeleton() {
  return (
    <div className="min-h-screen">
      <Nav />
      <div className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="skeleton h-4 w-24 mb-6" />
          <div className="skeleton h-10 w-64 mb-3" />
          <div className="skeleton h-5 w-80 mb-10" />
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            <div className="space-y-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card-soft p-6 md:p-8 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="skeleton h-12 w-12 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-16" />
                      <div className="skeleton h-6 w-52" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="skeleton h-24" />
                    <div className="skeleton h-24" />
                    <div className="skeleton h-24" />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="skeleton h-10" />
                    <div className="skeleton h-10" />
                    <div className="skeleton h-10" />
                  </div>
                </div>
              ))}
            </div>
            <aside className="space-y-6">
              <div className="skeleton h-56" />
              <div className="skeleton h-64" />
              <div className="skeleton h-32" />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttractionRow({ a, n }: { a: Attraction; n: number }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid place-items-center h-6 w-6 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold font-display">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-sm">{a.name}</div>
        {a.description && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{a.description}</p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground">
          {a.travelTime && (
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {a.travelTime}</span>
          )}
          {a.waitTime && (
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Wait {a.waitTime}</span>
          )}
          {a.photoTip && (
            <span className="inline-flex items-center gap-1"><Camera className="h-3 w-3" /> {a.photoTip}</span>
          )}
          {a.alternative && (
            <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> Alt: {a.alternative}</span>
          )}
        </div>
      </div>
    </li>
  );
}

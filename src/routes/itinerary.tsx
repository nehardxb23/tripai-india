import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sunrise, Sun, Moon, Utensils, Bus, Wallet, Lightbulb,
  Download, Bookmark, Check, ArrowLeft, CloudSun, Package
} from "lucide-react";
import jsPDF from "jspdf";
import { Nav } from "@/components/Nav";
import { loadTrip, type Trip } from "@/lib/trip-store";

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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t = loadTrip();
    if (!t) navigate({ to: "/" });
    else setTrip(t);
  }, [navigate]);

  if (!trip) return null;

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

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <header className="flex flex-wrap items-end justify-between gap-6 mb-10 animate-fade-in-up">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Your itinerary</div>
              <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight">{trip.input.destination}</h1>
              <p className="mt-3 text-muted-foreground text-lg">
                {trip.input.days} days · ₹{trip.input.budget.toLocaleString("en-IN")} · {trip.input.style}
              </p>
            </div>
          </header>

          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            {/* Days */}
            <div className="space-y-6">
              {trip.days.map((d, i) => (
                <article
                  key={d.day}
                  className="card-soft card-soft-hover p-6 md:p-8 animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span className="grid place-items-center h-12 w-12 rounded-2xl btn-primary-gradient font-display font-bold">
                      {d.day}
                    </span>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Day {d.day}</div>
                      <h2 className="font-display font-semibold text-2xl">{d.title}</h2>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <Slot icon={Sunrise} label="Morning" text={d.morning} tint="bg-amber-100/60 text-amber-700" />
                    <Slot icon={Sun} label="Afternoon" text={d.afternoon} tint="bg-orange-100/60 text-orange-700" />
                    <Slot icon={Moon} label="Evening" text={d.evening} tint="bg-indigo-100/60 text-indigo-700" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 pt-6 border-t border-border">
                    <MetaRow icon={Utensils} label="Local food" value={d.food} />
                    <MetaRow icon={Bus} label="Transport" value={d.transport} />
                    <MetaRow icon={Wallet} label="Budget" value={d.budget} />
                    <MetaRow icon={Lightbulb} label="Tip" value={d.tips} />
                  </div>
                </article>
              ))}
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

              <div className="space-y-3">
                <button onClick={downloadPDF} className="btn-primary-gradient w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold">
                  <Download className="h-4 w-4" /> Download PDF
                </button>
                <button onClick={save} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold border border-border bg-surface hover:border-foreground/40 transition-colors">
                  {saved ? <><Check className="h-4 w-4 text-accent" /> Saved!</> : <><Bookmark className="h-4 w-4" /> Save Trip</>}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slot({ icon: Icon, label, text, tint }: { icon: React.ElementType; label: string; text: string; tint: string }) {
  return (
    <div className="rounded-2xl border border-border p-4 bg-background/40">
      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tint}`}>
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-3 text-sm text-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid place-items-center h-9 w-9 rounded-xl bg-muted shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </span>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

import { Wallet, UtensilsCrossed, Bus, Sparkles } from "lucide-react";

type Item = { label: string; amount: number };

export function AnalyticsCards({ items }: { items: Item[] }) {
  const total = items.reduce((s, i) => s + i.amount, 0);
  const get = (label: string) =>
    items.find((i) => i.label.toLowerCase() === label.toLowerCase())?.amount ?? 0;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const cards = [
    {
      label: "Total Budget",
      value: `₹${total.toLocaleString("en-IN")}`,
      sub: "estimated trip cost",
      icon: Wallet,
      gradient: "from-primary/15 via-primary/5 to-transparent",
      iconBg: "bg-gradient-to-br from-primary to-primary-glow text-white",
      accent: "text-primary",
    },
    {
      label: "Food",
      value: `${pct(get("Food"))}%`,
      sub: `₹${get("Food").toLocaleString("en-IN")}`,
      icon: UtensilsCrossed,
      gradient: "from-amber-500/15 via-amber-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-400 text-white",
      accent: "text-amber-600",
    },
    {
      label: "Transport",
      value: `${pct(get("Transport"))}%`,
      sub: `₹${get("Transport").toLocaleString("en-IN")}`,
      icon: Bus,
      gradient: "from-sky-500/15 via-sky-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-sky-500 to-indigo-500 text-white",
      accent: "text-sky-600",
    },
    {
      label: "Activities",
      value: `${pct(get("Activities"))}%`,
      sub: `₹${get("Activities").toLocaleString("en-IN")}`,
      icon: Sparkles,
      gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-400 text-white",
      accent: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`card-soft card-soft-hover p-5 relative overflow-hidden bg-gradient-to-br ${c.gradient}`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className={`grid place-items-center h-10 w-10 rounded-2xl ${c.iconBg} shadow-md`}>
              <c.icon className="h-5 w-5" />
            </span>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {c.label}
          </div>
          <div className={`font-display font-bold text-2xl md:text-3xl mt-1 ${c.accent}`}>
            {c.value}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export function Nav() {
  return (
    <header className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center h-9 w-9 rounded-2xl btn-primary-gradient">
            <Compass className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display font-bold text-lg tracking-tight">
            TripAI <span className="text-primary">India</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
          <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="/#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          <a href="/#plan" className="hover:text-foreground transition-colors">Plan a trip</a>
        </nav>
        <a
          href="/#plan"
          className="btn-primary-gradient inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          Plan trip
        </a>
      </div>
    </header>
  );
}

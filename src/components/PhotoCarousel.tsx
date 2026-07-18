import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

// Uses Unsplash's public source redirect — no API key needed.
// Each keyword gives a different destination-relevant photo, cycled with a smooth fade.
function unsplashUrl(destination: string, keyword: string, seed: number) {
  const q = encodeURIComponent(`${destination},${keyword},india,travel`);
  return `https://source.unsplash.com/1600x900/?${q}&sig=${seed}`;
}

const KEYWORDS = ["skyline", "street", "temple", "market", "landmark", "food"];

export function PhotoCarousel({ destination }: { destination: string }) {
  const slides = KEYWORDS.map((k, i) => ({
    src: unsplashUrl(destination, k, i + 1),
    keyword: k,
  }));

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const go = (dir: number) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[42vh] md:h-[56vh] overflow-hidden rounded-[2rem] shadow-[var(--shadow-elevated)] bg-muted">
      {slides.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={`${destination} ${s.keyword}`}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 text-white">
        <div className="inline-flex items-center gap-2 rounded-full glass-card !bg-white/15 !border-white/20 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-white/90">
          <MapPin className="h-3.5 w-3.5" /> Destination
        </div>
        <h2 className="mt-3 font-display font-extrabold text-4xl md:text-6xl tracking-tight drop-shadow-lg">
          {destination}
        </h2>
      </div>

      {/* Controls */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous photo"
        className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 grid place-items-center rounded-full bg-white/80 backdrop-blur hover:bg-white transition text-foreground shadow-md"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next photo"
        className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 grid place-items-center rounded-full bg-white/80 backdrop-blur hover:bg-white transition text-foreground shadow-md"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 right-4 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Photo ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-8 bg-white" : "w-4 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

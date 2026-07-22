import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import fallbackImg from "@/assets/hero-india.jpg";

// Curated set of reliable Unsplash India travel photos (direct CDN URLs).
// These are stable image IDs — unlike source.unsplash.com which is deprecated.
const INDIA_PHOTOS = [
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80", // Taj Mahal
  "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=80", // Jaipur palace
  "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=80", // temple
  "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=80", // Hawa Mahal
  "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=1600&q=80", // Varanasi ghats
  "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80", // India street
];

export function PhotoCarousel({ destination }: { destination: string }) {
  const slides = INDIA_PHOTOS.map((src, i) => ({ src, i }));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const go = (dir: number) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src !== fallbackImg) img.src = fallbackImg;
  };

  return (
    <div className="relative w-full h-[42vh] md:h-[56vh] overflow-hidden rounded-[2rem] shadow-[var(--shadow-elevated)] bg-muted">
      {slides.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={`${destination} travel scene ${i + 1}`}
          loading={i === 0 ? "eager" : "lazy"}
          onError={handleError}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Subtle bottom-only gradient so photos stay clearly visible */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />

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

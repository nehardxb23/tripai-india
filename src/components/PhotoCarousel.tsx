import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import fallbackImg from "@/assets/hero-india.jpg";

// Generic India fallbacks (stable Unsplash CDN IDs) used only if no
// destination-specific photos can be found.
const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=80",
];

type CommonsResponse = {
  query?: {
    pages?: Record<
      string,
      { title?: string; imageinfo?: Array<{ thumburl?: string; width?: number; height?: number }> }
    >;
  };
};

async function fetchDestinationPhotos(destination: string): Promise<string[]> {
  const search = encodeURIComponent(`${destination} India`);
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&generator=search&gsrnamespace=6&gsrlimit=24&gsrsearch=${search}` +
    `&prop=imageinfo&iiprop=url|size&iiurlwidth=1600`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as CommonsResponse;
  const pages = Object.values(json.query?.pages ?? {});

  return pages
    .filter((p) => /\.(jpe?g|png)$/i.test(p.title ?? ""))
    .map((p) => p.imageinfo?.[0])
    .filter((info): info is { thumburl: string; width: number; height: number } =>
      Boolean(info?.thumburl && info.width && info.height),
    )
    // landscape-ish only, so the hero crop looks good
    .filter((info) => info.width / info.height > 1.2)
    .slice(0, 6)
    .map((info) => info.thumburl);
}

export function PhotoCarousel({ destination }: { destination: string }) {
  const [photos, setPhotos] = useState<string[]>(FALLBACK_PHOTOS);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIndex(0);
    setPhotos(FALLBACK_PHOTOS);
    if (!destination) return;

    fetchDestinationPhotos(destination)
      .then((found) => {
        if (!cancelled && found.length >= 2) setPhotos(found);
      })
      .catch(() => {
        /* keep fallbacks */
      });

    return () => {
      cancelled = true;
    };
  }, [destination]);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % photos.length), 5000);
    return () => clearInterval(t);
  }, [photos.length]);

  const go = (dir: number) =>
    setIndex((i) => (i + dir + photos.length) % photos.length);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src !== fallbackImg) img.src = fallbackImg;
  };

  return (
    <div className="relative w-full h-[42vh] md:h-[56vh] overflow-hidden rounded-[2rem] shadow-[var(--shadow-elevated)] bg-muted">
      {photos.map((src, i) => (
        <img
          key={src}
          src={src}
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
        {photos.map((_, i) => (
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

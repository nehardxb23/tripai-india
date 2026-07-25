import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { DayPlan, Attraction } from "@/lib/trip-store";

// Fix default marker icons for bundlers (Leaflet defaults reference bundler-resolved paths).
const DefaultIcon = L.icon({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const dayIcon = (n: number) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width:34px;height:34px;border-radius:50%;
      background:linear-gradient(135deg,#FF6B35,#FF8A5B);
      color:white;font-weight:700;font-family:Poppins,sans-serif;
      display:grid;place-items:center;font-size:14px;
      box-shadow:0 6px 16px -4px rgba(255,107,53,0.55);
      border:3px solid white;
    ">${n}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });

function FitBounds({ points }: { points: Array<[number, number]> }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    const bounds = L.latLngBounds(points.map(([lat, lng]) => L.latLng(lat, lng)));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);
  return null;
}

export default function TripMap({ days, destination }: { days: DayPlan[]; destination?: string }) {
  const allPoints = useMemo(
    () =>
      days.flatMap((d) =>
        d.attractions.map((a) => ({ day: d.day, attraction: a }))
      ),
    [days]
  );

  const positions = useMemo<Array<[number, number]>>(
    () => allPoints.map((p) => [p.attraction.lat, p.attraction.lng]),
    [allPoints]
  );

  const routes = useMemo(
    () =>
      days
        .map((d) => d.attractions.map((a) => [a.lat, a.lng] as [number, number]))
        .filter((line) => line.length >= 2),
    [days]
  );

  // Fallback: if the AI returned no coordinates (common for states like
  // "Delhi" or "Kerala"), geocode the destination so a map still renders.
  const [fallbackCenter, setFallbackCenter] = useState<[number, number] | null>(null);
  const needsFallback = positions.length === 0 && !!destination;

  useEffect(() => {
    if (!needsFallback) return;
    let cancelled = false;
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(
        destination!
      )}`
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((results: Array<{ lat: string; lon: string }>) => {
        const hit = results?.[0];
        if (!cancelled && hit) setFallbackCenter([Number(hit.lat), Number(hit.lon)]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [needsFallback, destination]);

  if (positions.length === 0 && !fallbackCenter) {
    return (
      <div className="grid place-items-center h-full text-sm text-muted-foreground">
        {needsFallback ? "Loading map…" : "No map coordinates for this trip."}
      </div>
    );
  }

  if (positions.length === 0 && fallbackCenter) {
    return (
      <MapContainer
        center={fallbackCenter}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", borderRadius: "1.5rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={fallbackCenter}>
          <Popup>{destination}</Popup>
        </Marker>
      </MapContainer>
    );
  }

  const center = positions[0];


  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: "1.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <FitBounds points={positions} />
      {routes.map((line, i) => (
        <Polyline
          key={i}
          positions={line}
          pathOptions={{
            color: "#FF6B35",
            weight: 3,
            opacity: 0.6,
            dashArray: "6 8",
          }}
        />
      ))}
      {allPoints.map(({ day, attraction }, i) => (
        <Marker
          key={`${day}-${i}-${attraction.name}`}
          position={[attraction.lat, attraction.lng]}
          icon={dayIcon(day)}
        >
          <Popup>
            <div style={{ minWidth: 200, fontFamily: "Inter, sans-serif" }}>
              <div style={{ fontSize: 11, color: "#FF6B35", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Day {day}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, margin: "2px 0 6px", fontFamily: "Poppins, sans-serif" }}>
                {attraction.name}
              </div>
              {attraction.description && (
                <p style={{ fontSize: 13, margin: 0, color: "#374151", lineHeight: 1.4 }}>
                  {attraction.description}
                </p>
              )}
              {attraction.photoTip && (
                <p style={{ fontSize: 12, margin: "6px 0 0", color: "#6B7280" }}>
                  📸 {attraction.photoTip}
                </p>
              )}
              {attraction.waitTime && (
                <p style={{ fontSize: 12, margin: "4px 0 0", color: "#6B7280" }}>
                  ⏱ Wait ~{attraction.waitTime}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export type { Attraction };

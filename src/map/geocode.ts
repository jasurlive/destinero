import type { Pin } from "./types";

// place name -> "searched" pin (OpenStreetMap Nominatim), null when nothing matches
export async function geocode(query: string): Promise<Pin | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const [first] = await res.json();
  if (!first) return null;
  return { type: "searched", name: query, coords: [Number(first.lat), Number(first.lon)] };
}

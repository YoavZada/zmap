import type { LngLatTuple } from "zmap";

export interface City {
  name: string;
  country: string;
  coordinates: LngLatTuple;
  population: string;
}

export const cities: City[] = [
  { name: "New York", country: "USA", coordinates: [-74.006, 40.7128], population: "8.3M" },
  { name: "London", country: "UK", coordinates: [-0.1276, 51.5072], population: "8.9M" },
  { name: "Tokyo", country: "Japan", coordinates: [139.6917, 35.6895], population: "13.9M" },
  { name: "Paris", country: "France", coordinates: [2.3522, 48.8566], population: "2.1M" },
  { name: "Sydney", country: "Australia", coordinates: [151.2093, -33.8688], population: "5.3M" },
  { name: "São Paulo", country: "Brazil", coordinates: [-46.6333, -23.5505], population: "12.3M" },
];

/** A walking route through central London (lng/lat waypoints). */
export const londonRoute: LngLatTuple[] = [
  [-0.1419, 51.5014], // Buckingham Palace
  [-0.1281, 51.5074], // Trafalgar Square
  [-0.1246, 51.5081], // Covent Garden
  [-0.1195, 51.5033], // Waterloo Bridge
  [-0.1057, 51.5079], // St Paul's
  [-0.0759, 51.5081], // Tower of London
];

export interface Arc {
  from: LngLatTuple;
  to: LngLatTuple;
  label: string;
}

/** Great-circle-ish flight arcs out of New York. */
export const flights: Arc[] = [
  { from: [-74.006, 40.7128], to: [-0.1276, 51.5072], label: "JFK → LHR" },
  { from: [-74.006, 40.7128], to: [139.6917, 35.6895], label: "JFK → HND" },
  { from: [-74.006, 40.7128], to: [2.3522, 48.8566], label: "JFK → CDG" },
  { from: [-74.006, 40.7128], to: [-46.6333, -23.5505], label: "JFK → GRU" },
];

/** Deterministic pseudo-random scatter so the cluster demo is stable. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scatter(
  center: LngLatTuple,
  spread: number,
  count: number,
  rng: () => number,
): LngLatTuple[] {
  const out: LngLatTuple[] = [];
  for (let i = 0; i < count; i++) {
    out.push([
      center[0] + (rng() - 0.5) * spread,
      center[1] + (rng() - 0.5) * spread * 0.7,
    ]);
  }
  return out;
}

const rng = mulberry32(42);

export const clusterPoints: { longitude: number; latitude: number }[] = [
  ...scatter([-74.006, 40.7128], 1.2, 120, rng),
  ...scatter([-0.1276, 51.5072], 0.9, 90, rng),
  ...scatter([2.3522, 48.8566], 0.7, 70, rng),
  ...scatter([139.6917, 35.6895], 1.0, 110, rng),
].map(([longitude, latitude]) => ({ longitude, latitude }));

import type { FeatureCollection } from "geojson";
import type { LngLatTuple } from "zmapgl";

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

// ---------------------------------------------------------------------------
// Data-viz datasets: choropleth & 3D extrusion (usStates, buildings), hexbin
// (scatterPoints), and time playback (trips).
// ---------------------------------------------------------------------------

/** A `value`-carrying polygon. `extra` merges extra properties (e.g. height). */
function box(
  name: string,
  value: number,
  [w, s]: LngLatTuple,
  [e, n]: LngLatTuple,
  extra: Record<string, unknown> = {},
): FeatureCollection["features"][number] {
  return {
    type: "Feature",
    properties: { name, value, ...extra },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [w, s],
          [e, s],
          [e, n],
          [w, n],
          [w, s],
        ],
      ],
    },
  };
}

/**
 * Rough US-state rectangles tagged with a population-density value
 * (people / mi²) — a stand-in for a real states GeoJSON, enough to drive a
 * choropleth and a 3D extrusion without shipping a heavy boundary file.
 */
export const usStates: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    box("California", 254, [-124, 32.5], [-114.2, 42]),
    box("Washington", 117, [-124.7, 45.6], [-117, 49]),
    box("Arizona", 64, [-114.8, 31.4], [-109.1, 37]),
    box("Colorado", 56, [-109, 37], [-102.1, 41]),
    box("Texas", 108, [-106.5, 25.9], [-93.6, 36.5]),
    box("Illinois", 230, [-91.5, 37], [-87.6, 42.5]),
    box("Ohio", 290, [-84.8, 38.5], [-80.6, 41.9]),
    box("Georgia", 185, [-85.6, 30.5], [-80.9, 35]),
    box("Florida", 410, [-87.6, 25], [-80.1, 31]),
    box("New York", 421, [-79.7, 40.5], [-71.9, 45]),
  ],
};

/** A grid of building footprints around Midtown Manhattan, with floor heights. */
export const buildings: FeatureCollection = (() => {
  const brng = mulberry32(7);
  const center: LngLatTuple = [-73.984, 40.748];
  const cols = 13;
  const rows = 16;
  const cellLng = 0.0016;
  const cellLat = 0.0013;
  const gapLng = 0.0005;
  const gapLat = 0.00045;
  const features: FeatureCollection["features"] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c % 5 === 2) continue; // leave avenues for a city feel
      const w0 = center[0] + (c - cols / 2) * cellLng;
      const s0 = center[1] + (r - rows / 2) * cellLat;
      const e0 = w0 + (cellLng - gapLng);
      const n0 = s0 + (cellLat - gapLat);
      const base = brng();
      const height = Math.round(
        20 + base * base * 260 + (brng() > 0.92 ? 180 : 0),
      );
      features.push(box(`b${r}-${c}`, height, [w0, s0], [e0, n0], { height }));
    }
  }
  return { type: "FeatureCollection", features };
})();

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Resample a polyline into `steps + 1` evenly-parameterized positions. */
function samplePath(path: LngLatTuple[], steps: number): LngLatTuple[] {
  const segs = path.length - 1;
  const out: LngLatTuple[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = (i / steps) * segs;
    const si = Math.min(Math.floor(u), segs - 1);
    const f = u - si;
    out.push([
      lerp(path[si][0], path[si + 1][0], f),
      lerp(path[si][1], path[si + 1][1], f),
    ]);
  }
  return out;
}

const TRIP_STEPS = 90;
const TRIP_DURATION = 600; // seconds

const tripRoutes: { name: string; path: LngLatTuple[] }[] = [
  { name: "A", path: londonRoute },
  {
    name: "B",
    path: [
      [-0.162, 51.49],
      [-0.14, 51.5],
      [-0.11, 51.515],
      [-0.085, 51.525],
      [-0.06, 51.53],
    ],
  },
  {
    name: "C",
    path: [
      [-0.1, 51.475],
      [-0.105, 51.495],
      [-0.115, 51.515],
      [-0.125, 51.535],
      [-0.13, 51.55],
    ],
  },
];

/**
 * Three London trips as time-stamped points (`time` in seconds, `trip` id) —
 * sampled along each route so a playhead can animate vehicles along them.
 */
export const trips: FeatureCollection = {
  type: "FeatureCollection",
  features: tripRoutes.flatMap((route) =>
    samplePath(route.path, TRIP_STEPS).map((coords, i) => ({
      type: "Feature" as const,
      properties: {
        time: Math.round((i / TRIP_STEPS) * TRIP_DURATION),
        trip: route.name,
      },
      geometry: { type: "Point" as const, coordinates: coords },
    })),
  ),
};

export interface ScatterPoint {
  longitude: number;
  latitude: number;
  properties: { magnitude: number };
}

/** ~870 weighted points clustered over US metros — fodder for hexbin/grid demos. */
export const scatterPoints: ScatterPoint[] = (() => {
  const srng = mulberry32(99);
  const blobs: [number, number, number, number][] = [
    [-118.2, 34.05, 6, 220], // Los Angeles
    [-87.65, 41.85, 5, 200], // Chicago
    [-74.0, 40.72, 4, 240], // New York
    [-95.37, 29.76, 4, 120], // Houston
    [-122.33, 47.6, 3.5, 90], // Seattle
  ];
  const out: ScatterPoint[] = [];
  for (const [lng, lat, spread, count] of blobs) {
    for (let i = 0; i < count; i++) {
      const dx = (srng() - 0.5 + srng() - 0.5) * spread;
      const dy = (srng() - 0.5 + srng() - 0.5) * spread * 0.7;
      out.push({
        longitude: lng + dx,
        latitude: lat + dy,
        properties: { magnitude: 1 + Math.floor(srng() * 10) },
      });
    }
  }
  return out;
})();

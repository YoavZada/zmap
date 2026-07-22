import type { FeatureCollection, Geometry } from "geojson";
import type { LngLatTuple } from "zmapgl";
import worldGeo from "./geo/worldCountries.geo.json";
import usStatesGeo from "./geo/usStates.geo.json";

export interface City {
  name: string;
  country: string;
  coordinates: LngLatTuple;
  population: string;
}

export const cities: City[] = [
  {
    name: "New York",
    country: "USA",
    coordinates: [-74.006, 40.7128],
    population: "8.3M",
  },
  {
    name: "London",
    country: "UK",
    coordinates: [-0.1276, 51.5072],
    population: "8.9M",
  },
  {
    name: "Tokyo",
    country: "Japan",
    coordinates: [139.6917, 35.6895],
    population: "13.9M",
  },
  {
    name: "Paris",
    country: "France",
    coordinates: [2.3522, 48.8566],
    population: "2.1M",
  },
  {
    name: "Sydney",
    country: "Australia",
    coordinates: [151.2093, -33.8688],
    population: "5.3M",
  },
  {
    name: "São Paulo",
    country: "Brazil",
    coordinates: [-46.6333, -23.5505],
    population: "12.3M",
  },
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
  return () => {
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

/** Cluster-demo cities: New York + Tokyo, plus a dense scatter across Europe. */
const clusterCities: { center: LngLatTuple; spread: number; count: number }[] =
  [
    { center: [-74.006, 40.7128], spread: 1.2, count: 120 }, // New York
    { center: [139.6917, 35.6895], spread: 1.0, count: 110 }, // Tokyo
    { center: [-0.1276, 51.5072], spread: 0.9, count: 90 }, // London
    { center: [2.3522, 48.8566], spread: 0.7, count: 70 }, // Paris
    { center: [13.405, 52.52], spread: 0.7, count: 85 }, // Berlin
    { center: [-3.7038, 40.4168], spread: 0.7, count: 70 }, // Madrid
    { center: [2.1734, 41.3851], spread: 0.5, count: 55 }, // Barcelona
    { center: [-9.1393, 38.7223], spread: 0.5, count: 45 }, // Lisbon
    { center: [12.4964, 41.9028], spread: 0.6, count: 65 }, // Rome
    { center: [9.19, 45.4642], spread: 0.5, count: 55 }, // Milan
    { center: [4.9041, 52.3676], spread: 0.5, count: 55 }, // Amsterdam
    { center: [11.582, 48.1351], spread: 0.45, count: 50 }, // Munich
    { center: [16.3738, 48.2082], spread: 0.5, count: 50 }, // Vienna
    { center: [18.0686, 59.3293], spread: 0.6, count: 45 }, // Stockholm
  ];

/** How many cities the cluster demo scatters points across. */
export const clusterCityCount = clusterCities.length;

export const clusterPoints: { longitude: number; latitude: number }[] =
  clusterCities
    .flatMap(({ center, spread, count }) => scatter(center, spread, count, rng))
    .map(([longitude, latitude]) => ({ longitude, latitude }));

// ---------------------------------------------------------------------------
// Data-viz datasets. Choropleth / 3D extrusion color *real* boundary polygons
// (worldCountries, usStates, europeSales — bundled from src/geo, see
// scripts/gen-geo.mjs), while the synthetic sets below stay procedural because
// their point is aggregation, not geography: buildings (a stylized block grid),
// scatterPoints (hexbin/heatmap fodder), and trips (time playback).
// ---------------------------------------------------------------------------

/** Stable hash of a string → [0, 1). Keeps illustrative demo values fixed. */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

interface RawBoundary {
  properties: { name: string; region?: string; density?: number };
  geometry: Geometry;
}

/**
 * Re-tag bundled boundary polygons with a numeric `value` the layers color by,
 * optionally filtering to a subset. Geometry passes through untouched.
 */
function boundaries(
  raw: { features: RawBoundary[] },
  value: (props: RawBoundary["properties"]) => number,
  keep: (props: RawBoundary["properties"]) => boolean = () => true,
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: raw.features
      .filter((f) => keep(f.properties))
      .map((f) => ({
        type: "Feature",
        properties: { name: f.properties.name, value: value(f.properties) },
        geometry: f.geometry,
      })),
  };
}

const world = worldGeo as unknown as { features: RawBoundary[] };
const states = usStatesGeo as unknown as { features: RawBoundary[] };

/**
 * Illustrative "visitors" (thousands) per country — a US/English-leaning
 * audience: a handful of bright markets over a faint global wash. Not real
 * analytics, just enough to make a world choropleth read.
 */
const TOP_MARKETS: Record<string, number> = {
  "United States of America": 100,
  India: 74,
  "United Kingdom": 66,
  Germany: 55,
  Brazil: 50,
  France: 46,
  Canada: 44,
  China: 40,
  Australia: 36,
  Netherlands: 30,
  Spain: 28,
  Japan: 26,
  Italy: 24,
  Mexico: 22,
  Sweden: 20,
  Poland: 18,
  Ireland: 17,
};

/** World country polygons colored by illustrative visitor counts. */
export const worldCountries: FeatureCollection = boundaries(
  world,
  ({ name }) => TOP_MARKETS[name] ?? Math.round(2 + hash01(name) * 12),
);

/**
 * US state polygons carrying real 2010-census population density (people/mi²)
 * as `value` — drives the choropleth ramp/step demos and the 3D extrusion.
 */
export const usStates: FeatureCollection = boundaries(
  states,
  ({ density }) => density ?? 0,
);

/**
 * European country polygons with an illustrative "sales" value ($M) — for the
 * Legend and LayerControl demos. Russia is dropped: it dwarfs the frame.
 */
export const europeSales: FeatureCollection = boundaries(
  world,
  ({ name }) => Math.round(12 + hash01(name) * 84),
  ({ region, name }) => region === "Europe" && name !== "Russia",
);

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

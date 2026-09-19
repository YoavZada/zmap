import type { LngLatTuple } from "./geojson";
import type { ZmapLocaleText } from "../locales/types";

/** Mean Earth radius in metres — used for great-circle distances. */
const EARTH_RADIUS = 6371008.8;
/** Equatorial radius in metres — used for the spherical polygon-area formula. */
const EARTH_RADIUS_EQ = 6378137;
const DEG2RAD = Math.PI / 180;

/** Unit system for measurement readouts: metric (meters/km) or imperial (feet/miles). */
export type MeasureUnit = "metric" | "imperial";

/** Great-circle (haversine) distance between two lng/lat points, in metres. */
export function haversineDistance(a: LngLatTuple, b: LngLatTuple): number {
  const lat1 = a[1] * DEG2RAD;
  const lat2 = b[1] * DEG2RAD;
  const dLat = (b[1] - a[1]) * DEG2RAD;
  const dLon = (b[0] - a[0]) * DEG2RAD;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Total length of a path (sum of segment great-circle distances), in metres. */
export function lineDistance(coords: LngLatTuple[]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineDistance(coords[i - 1], coords[i]);
  }
  return total;
}

/**
 * Spherical area of a polygon ring, in square metres. The ring need not repeat
 * its first point — it is treated as implicitly closed. Winding-order agnostic
 * (always returns a non-negative area).
 */
export function polygonArea(ring: LngLatTuple[]): number {
  const n = ring.length;
  if (n < 3) return 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    const [lon1, lat1] = ring[i];
    const [lon2, lat2] = ring[(i + 1) % n];
    total +=
      (lon2 - lon1) *
      DEG2RAD *
      (2 + Math.sin(lat1 * DEG2RAD) + Math.sin(lat2 * DEG2RAD));
  }
  return Math.abs((total * EARTH_RADIUS_EQ * EARTH_RADIUS_EQ) / 2);
}

/** Unit labels used by `formatDistance` / `formatArea`. Defaults are English abbreviations. */
export interface MeasureUnitLabels {
  meters: string;
  kilometers: string;
  feet: string;
  miles: string;
  squareMeters: string;
  squareKilometers: string;
  acres: string;
  squareMiles: string;
}

/** Options for the measurement formatters. */
export interface FormatOptions {
  /** BCP-47 locale for `Intl.NumberFormat` (decimal separator, grouping). Default: the runtime's default locale. */
  locale?: string;
  /** Override any unit label (e.g. from `useLocaleText()`). */
  units?: Partial<MeasureUnitLabels>;
  /** Maximum fraction digits. Default 2. */
  maximumFractionDigits?: number;
}

const DEFAULT_UNITS: MeasureUnitLabels = {
  meters: "m",
  kilometers: "km",
  feet: "ft",
  miles: "mi",
  squareMeters: "m²",
  squareKilometers: "km²",
  acres: "ac",
  squareMiles: "mi²",
};

/**
 * Maps the `unit*` keys off a `ZmapLocaleText` onto `MeasureUnitLabels`, for
 * passing `useLocaleText()`'s value straight into `formatDistance`/`formatArea`.
 */
export function localeUnitLabels(t: ZmapLocaleText): MeasureUnitLabels {
  return {
    meters: t.unitMeters,
    kilometers: t.unitKilometers,
    feet: t.unitFeet,
    miles: t.unitMiles,
    squareMeters: t.unitSquareMeters,
    squareKilometers: t.unitSquareKilometers,
    acres: t.unitAcres,
    squareMiles: t.unitSquareMiles,
  };
}

/**
 * Formats a rounded whole number (the "below threshold" branch — no
 * fractional digits, mirrors the old `` `${Math.round(value)}` `` — never
 * grouped, so `en-US` defaults stay byte-identical).
 */
function formatWhole(
  value: number,
  options: FormatOptions | undefined,
): string {
  return new Intl.NumberFormat(options?.locale, {
    maximumFractionDigits: 0,
    useGrouping: false,
  }).format(Math.round(value));
}

/**
 * Formats a value at a fixed fraction-digit count (the "above threshold"
 * branch — mirrors the old `value.toFixed(2)`, trailing zeros included —
 * never grouped, so `en-US` defaults stay byte-identical).
 */
function formatFixed(
  value: number,
  options: FormatOptions | undefined,
): string {
  const digits = options?.maximumFractionDigits ?? 2;
  return new Intl.NumberFormat(options?.locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: false,
  }).format(value);
}

/** Formats a distance in metres as a human label ("850 m", "1.20 km", "2.4 mi"). */
export function formatDistance(
  meters: number,
  unit: MeasureUnit = "metric",
  options?: FormatOptions,
): string {
  const units: MeasureUnitLabels = { ...DEFAULT_UNITS, ...options?.units };
  if (unit === "imperial") {
    const feet = meters * 3.28084;
    return feet < 5280
      ? `${formatWhole(feet, options)} ${units.feet}`
      : `${formatFixed(feet / 5280, options)} ${units.miles}`;
  }
  return meters < 1000
    ? `${formatWhole(meters, options)} ${units.meters}`
    : `${formatFixed(meters / 1000, options)} ${units.kilometers}`;
}

/** Formats an area in m² as a human label ("850 m²", "1.20 km²", "3.4 ac"). */
export function formatArea(
  squareMeters: number,
  unit: MeasureUnit = "metric",
  options?: FormatOptions,
): string {
  const units: MeasureUnitLabels = { ...DEFAULT_UNITS, ...options?.units };
  if (unit === "imperial") {
    const acres = squareMeters / 4046.8564224;
    return acres < 640
      ? `${formatFixed(acres, options)} ${units.acres}`
      : `${formatFixed(squareMeters / 2_589_988.110336, options)} ${units.squareMiles}`;
  }
  return squareMeters < 1_000_000
    ? `${formatWhole(squareMeters, options)} ${units.squareMeters}`
    : `${formatFixed(squareMeters / 1_000_000, options)} ${units.squareKilometers}`;
}

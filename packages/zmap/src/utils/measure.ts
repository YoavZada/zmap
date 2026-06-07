import type { LngLatTuple } from "./geojson";

/** Mean Earth radius in metres — used for great-circle distances. */
const EARTH_RADIUS = 6371008.8;
/** Equatorial radius in metres — used for the spherical polygon-area formula. */
const EARTH_RADIUS_EQ = 6378137;
const DEG2RAD = Math.PI / 180;

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

/** Formats a distance in metres as a human label ("850 m", "1.20 km", "2.4 mi"). */
export function formatDistance(
  meters: number,
  unit: MeasureUnit = "metric",
): string {
  if (unit === "imperial") {
    const feet = meters * 3.28084;
    return feet < 5280
      ? `${Math.round(feet)} ft`
      : `${(feet / 5280).toFixed(2)} mi`;
  }
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(2)} km`;
}

/** Formats an area in m² as a human label ("850 m²", "1.20 km²", "3.4 ac"). */
export function formatArea(
  squareMeters: number,
  unit: MeasureUnit = "metric",
): string {
  if (unit === "imperial") {
    const acres = squareMeters / 4046.8564224;
    return acres < 640
      ? `${acres.toFixed(2)} ac`
      : `${(squareMeters / 2_589_988.110336).toFixed(2)} mi²`;
  }
  return squareMeters < 1_000_000
    ? `${Math.round(squareMeters)} m²`
    : `${(squareMeters / 1_000_000).toFixed(2)} km²`;
}

import type { LngLatTuple } from "./geojson";

export type ArcType = "bezier" | "geodesic";

export interface ArcOptions {
  /** Bulge factor for the bezier arc (0 = straight line). Default 0.3. */
  curvature?: number;
  /** Number of sampled points along the arc. Default 64. */
  points?: number;
  /** "bezier" (classic flight-path bulge) or "geodesic" (great-circle). */
  type?: ArcType;
}

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/** Quadratic bezier with a control point offset perpendicular to the chord. */
function bezierArc(
  from: LngLatTuple,
  to: LngLatTuple,
  curvature: number,
  n: number,
): LngLatTuple[] {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // Control point pushed off the midpoint, perpendicular to the chord.
  const cx = mx - dy * curvature;
  const cy = my + dx * curvature;

  const coords: LngLatTuple[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const mt = 1 - t;
    const x = mt * mt * x1 + 2 * mt * t * cx + t * t * x2;
    const y = mt * mt * y1 + 2 * mt * t * cy + t * t * y2;
    coords.push([x, y]);
  }
  return coords;
}

/** Great-circle (shortest path on a sphere) interpolation. */
function geodesicArc(
  from: LngLatTuple,
  to: LngLatTuple,
  n: number,
): LngLatTuple[] {
  const lon1 = from[0] * DEG2RAD;
  const lat1 = from[1] * DEG2RAD;
  const lon2 = to[0] * DEG2RAD;
  const lat2 = to[1] * DEG2RAD;

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2,
      ),
    );

  if (d === 0) return [from, to];

  const coords: LngLatTuple[] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x =
      A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y =
      A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lon = Math.atan2(y, x);
    coords.push([lon * RAD2DEG, lat * RAD2DEG]);
  }
  return coords;
}

/** Generates the coordinate path for an arc between two points. */
export function generateArc(
  from: LngLatTuple,
  to: LngLatTuple,
  options: ArcOptions = {},
): LngLatTuple[] {
  const { curvature = 0.3, points = 64, type = "bezier" } = options;
  const n = Math.max(2, Math.floor(points));
  return type === "geodesic"
    ? geodesicArc(from, to, n)
    : bezierArc(from, to, curvature, n);
}

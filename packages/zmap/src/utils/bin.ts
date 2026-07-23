import type { Feature, FeatureCollection, Polygon } from "geojson";
import type { BasePoint } from "./geojson";

/** A point aggregated by `binPoints` (and rendered by `<HexbinLayer>`). */
export type BinPoint = BasePoint;

/** Options controlling how `binPoints` aggregates points into cells. */
export interface BinOptions {
  /** Cell shape. Default "hex". */
  cell?: "hex" | "square";
  /** Approximate cell size in kilometers. Default 50. */
  radius?: number;
  /** Sum this numeric point property instead of counting points. */
  weightProperty?: string;
}

/** Aggregated value (`count`, or summed `weightProperty`) carried by each bin. */
export type BinProperties = {
  /** Aggregated value — the point count, or summed `weightProperty` when set. */
  value: number;
  /** Number of points that fell in this bin, regardless of weighting. */
  count: number;
};
/** A FeatureCollection of bin polygons, as returned by `binPoints`. */
export type BinnedFeatureCollection = FeatureCollection<Polygon, BinProperties>;

const KM_PER_DEG_LAT = 110.574;
const kmPerDegLng = (lat: number) => 111.32 * Math.cos((lat * Math.PI) / 180);

// Pointy-top hexagon corner offsets (unit radius = center→vertex), matching the
// d3-hexbin grid: width √3·r, height 2·r, rows offset by 1.5·r.
const HEX_ANGLES = [0, 1, 2, 3, 4, 5].map((i) => (i * Math.PI) / 3);

type Bin = { x: number; y: number; value: number; count: number };

/**
 * Aggregates scattered lng/lat points into hexagonal or square cells, returning
 * a GeoJSON polygon per non-empty cell with `{ value, count }`. Binning happens
 * on a local equirectangular plane (km) centered on the data's mean latitude —
 * exact enough for city/region-scale views, approximate near the poles or
 * across very wide extents.
 */
export function binPoints(
  points: BinPoint[],
  options: BinOptions = {},
): BinnedFeatureCollection {
  const { cell = "hex", radius = 50, weightProperty } = options;
  if (points.length === 0) {
    return { type: "FeatureCollection", features: [] };
  }

  // Reference latitude → linear, invertible lng/lat ⇄ km projection.
  const refLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
  const kx = kmPerDegLng(refLat) || 1e-9;
  const ky = KM_PER_DEG_LAT;
  const toKm = (p: BinPoint): [number, number] => [
    p.longitude * kx,
    p.latitude * ky,
  ];
  const toLngLat = (x: number, y: number): [number, number] => [x / kx, y / ky];
  const weightOf = (p: BinPoint): number => {
    if (!weightProperty) return 1;
    const w = p.properties?.[weightProperty];
    return typeof w === "number" && Number.isFinite(w) ? w : 0;
  };

  const bins = new Map<string, Bin>();
  const add = (key: string, cx: number, cy: number, w: number) => {
    const existing = bins.get(key);
    if (existing) {
      existing.value += w;
      existing.count += 1;
    } else {
      bins.set(key, { x: cx, y: cy, value: w, count: 1 });
    }
  };

  if (cell === "square") {
    // Edge sized so square cells cover ~the same area as hexes of `radius`.
    const edge = radius * 1.6;
    for (const p of points) {
      const [x, y] = toKm(p);
      const ix = Math.floor(x / edge);
      const iy = Math.floor(y / edge);
      add(`${ix}-${iy}`, (ix + 0.5) * edge, (iy + 0.5) * edge, weightOf(p));
    }
  } else {
    const dx = radius * 2 * Math.sin(Math.PI / 3); // √3 · r
    const dy = radius * 1.5;
    for (const p of points) {
      const [x, y] = toKm(p);
      const py = y / dy;
      let pj = Math.round(py);
      const px = x / dx - (pj & 1 ? 0.5 : 0);
      let pi = Math.round(px);
      const py1 = py - pj;
      if (Math.abs(py1) * 3 > 1) {
        const px1 = px - pi;
        const pi2 = pi + (px < pi ? -1 : 1) / 2;
        const pj2 = pj + (py < pj ? -1 : 1);
        const px2 = px - pi2;
        const py2 = py - pj2;
        if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) {
          pi = pi2 + (pj & 1 ? 1 : -1) / 2;
          pj = pj2;
        }
      }
      const cx = (pi + (pj & 1 ? 0.5 : 0)) * dx;
      const cy = pj * dy;
      add(`${pi}-${pj}`, cx, cy, weightOf(p));
    }
  }

  const half = (radius * 1.6) / 2;
  const features: Feature<Polygon, BinProperties>[] = [];
  for (const bin of bins.values()) {
    const ring: [number, number][] =
      cell === "square"
        ? [
            [bin.x - half, bin.y - half],
            [bin.x + half, bin.y - half],
            [bin.x + half, bin.y + half],
            [bin.x - half, bin.y + half],
            [bin.x - half, bin.y - half],
          ].map(([x, y]) => toLngLat(x, y))
        : [
            ...HEX_ANGLES.map(
              (a) =>
                toLngLat(
                  bin.x + Math.sin(a) * radius,
                  bin.y - Math.cos(a) * radius,
                ) as [number, number],
            ),
            // close the ring
            toLngLat(
              bin.x + Math.sin(0) * radius,
              bin.y - Math.cos(0) * radius,
            ),
          ];
    features.push({
      type: "Feature",
      properties: { value: bin.value, count: bin.count },
      geometry: { type: "Polygon", coordinates: [ring] },
    });
  }

  return { type: "FeatureCollection", features };
}

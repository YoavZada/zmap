/** A pixel-space point, matching MapLibre's `map.project()` return shape. */
export interface ScreenPoint {
  x: number;
  y: number;
}

/**
 * Ray-casting point-in-polygon test in screen (pixel) space. The ring is an
 * ordered list of vertices; it is treated as implicitly closed. Points exactly
 * on an edge are reported inconsistently (as is standard for ray casting) —
 * fine for lasso selection, where pixel-perfect edges don't matter.
 */
export function pointInPolygon(
  point: ScreenPoint,
  ring: ScreenPoint[],
): boolean {
  if (ring.length < 3) return false;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const { x: xi, y: yi } = ring[i];
    const { x: xj, y: yj } = ring[j];
    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** True when a point falls within the axis-aligned box defined by two corners. */
export function pointInBox(
  point: ScreenPoint,
  a: ScreenPoint,
  b: ScreenPoint,
): boolean {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  return (
    point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  );
}

import type { LngLatTuple } from "zmapgl";

/** A point the user dropped on the map (in any location, on or off a street). */
export type RoutePoint = {
  id: number;
  lng: number;
  lat: number;
  /** Optional custom label; falls back to the visiting number when unset. */
  name?: string;
};

/**
 * How the visiting order is decided:
 * - `"optimized"` — the engine reorders the points into the shortest tour.
 * - `"fixed"` — the points are visited in the order they were dropped.
 */
export type RouteOrder = "optimized" | "fixed";

/**
 * The route computed by the routing engine over the real street network. For
 * two points it's the shortest road route; for three or more it's the optimal
 * open tour visiting every point (a traveling-salesman path).
 */
export type RouteResult = {
  /** The full polyline following real streets, in visiting order. */
  coordinates: LngLatTuple[];
  /** Total driving distance along the streets, in meters. */
  distanceMeters: number;
  /** Estimated driving time, in seconds. */
  durationSeconds: number;
  /**
   * The 0-based visiting position of each input point, indexed by input order.
   * `visitOrder[i] === 0` means input point `i` is visited first. For three or
   * more points this encodes the optimized order.
   */
  visitOrder: number[];
  /**
   * Where each input point snaps onto the street network, indexed by input
   * order. The route runs between these snapped points; only this on-street
   * travel counts toward the distance.
   */
  snapped: LngLatTuple[];
};

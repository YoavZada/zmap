import type { LngLatTuple } from "zmap";
import type { RouteOrder, RouteResult } from "./types";

/**
 * Public OSRM demo server. It routes over the real OpenStreetMap road network,
 * so paths follow the actual streets shown on the basemap. No API key; it's
 * rate-limited and meant for light demo traffic.
 */
const OSRM_BASE = "https://router.project-osrm.org";

/** A routing failure we can show to the user (vs. a programming error). */
export class RoutingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoutingError";
  }
}

type OsrmGeometry = { coordinates: [number, number][] };
type OsrmLeg = { geometry: OsrmGeometry; distance: number; duration: number };
type OsrmWaypoint = { location: [number, number]; waypoint_index?: number };
type OsrmResponse = {
  code: string;
  message?: string;
  routes?: OsrmLeg[];
  trips?: OsrmLeg[];
  waypoints?: OsrmWaypoint[];
};

function coordPath(points: LngLatTuple[]): string {
  return points.map(([lng, lat]) => `${lng},${lat}`).join(";");
}

/**
 * Route through every point along real streets.
 *
 * - `order: "fixed"` → visit the points in the given order (`/route`).
 * - `order: "optimized"` with **3+ points** → the optimal open tour that starts
 *   at the first point and visits the rest in the cheapest order (`/trip`, a
 *   traveling-salesman solve); `visitOrder` reflects that reordering.
 * - With **2 points** the order is moot, so it's always a plain `/route`.
 *
 * Only on-street travel contributes to `distanceMeters`; each point is snapped
 * to the nearest street first (`snapped`), so points can sit anywhere.
 */
export async function fetchRoute(
  points: LngLatTuple[],
  order: RouteOrder,
  signal: AbortSignal,
): Promise<RouteResult> {
  if (points.length < 2) {
    throw new RoutingError("Drop at least two points to build a route.");
  }

  const isTour = order === "optimized" && points.length > 2;
  const service = isTour ? "trip" : "route";
  const params = isTour
    ? "source=first&roundtrip=false&geometries=geojson&overview=full"
    : "geometries=geojson&overview=full";
  const url = `${OSRM_BASE}/${service}/v1/driving/${coordPath(points)}?${params}`;

  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new RoutingError("Couldn't reach the routing service.");
  }
  if (!res.ok) {
    throw new RoutingError(`Routing service error (HTTP ${res.status}).`);
  }

  const data = (await res.json()) as OsrmResponse;
  if (data.code !== "Ok") {
    const noRoute = data.code === "NoRoute" || data.code === "NoTrips";
    throw new RoutingError(
      noRoute
        ? "No road route connects these points."
        : (data.message ?? "The routing service couldn't build a route."),
    );
  }

  const leg = (isTour ? data.trips : data.routes)?.[0];
  const waypoints = data.waypoints ?? [];
  if (!leg || waypoints.length !== points.length) {
    throw new RoutingError(
      "The routing service returned an unexpected result.",
    );
  }

  // Waypoints come back in input order; `waypoint_index` is the position in the
  // computed (possibly reordered) trip. For `/route` there's no reordering, so
  // fall back to the input index.
  const visitOrder = waypoints.map((w, i) => w.waypoint_index ?? i);
  const snapped = waypoints.map(
    (w) => [w.location[0], w.location[1]] as LngLatTuple,
  );

  return {
    coordinates: leg.geometry.coordinates.map(
      ([lng, lat]) => [lng, lat] as LngLatTuple,
    ),
    distanceMeters: leg.distance,
    durationSeconds: leg.duration,
    visitOrder,
    snapped,
  };
}

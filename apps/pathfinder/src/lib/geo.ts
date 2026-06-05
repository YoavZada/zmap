import type { LngLatTuple } from "zmap";
import type { GraphNode, RoadNetwork } from "./types";

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two [lng, lat] points, in meters. */
export function haversineMeters(a: LngLatTuple, b: LngLatTuple): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** The graph node closest to a clicked coordinate (used to snap A/B onto roads). */
export function nearestNode(network: RoadNetwork, point: LngLatTuple): GraphNode {
  let best = network.nodes[0];
  let bestD = Infinity;
  for (const node of network.nodes) {
    const d = haversineMeters(point, [node.lng, node.lat]);
    if (d < bestD) {
      bestD = d;
      best = node;
    }
  }
  return best;
}

/** Human-readable distance, e.g. "740 m" or "2.31 km". */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

import type {
  Feature,
  FeatureCollection,
  LineString,
  Point,
} from "geojson";

/** A [longitude, latitude] pair. */
export type LngLatTuple = [number, number];

export function lineFeature(
  coordinates: LngLatTuple[],
  properties: Record<string, unknown> = {},
): Feature<LineString> {
  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates },
    properties,
  };
}

export function pointFeature(
  coordinate: LngLatTuple,
  properties: Record<string, unknown> = {},
): Feature<Point> {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: coordinate },
    properties,
  };
}

export function featureCollection<G extends Feature>(
  features: G[],
): FeatureCollection {
  return { type: "FeatureCollection", features: features as Feature[] };
}

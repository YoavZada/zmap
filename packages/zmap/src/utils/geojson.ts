import type { Feature, FeatureCollection, LineString, Point } from "geojson";

/** A [longitude, latitude] pair. */
export type LngLatTuple = [number, number];

/** Wraps a list of [longitude, latitude] coordinates in a GeoJSON LineString Feature. */
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

/** Wraps a [longitude, latitude] coordinate in a GeoJSON Point Feature. */
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

/** Wraps a list of features in a GeoJSON FeatureCollection. */
export function featureCollection<G extends Feature>(
  features: G[],
): FeatureCollection {
  return { type: "FeatureCollection", features: features as Feature[] };
}

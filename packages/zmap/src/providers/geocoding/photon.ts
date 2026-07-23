import type { GeocodeResult, GeocodingProvider } from "./types";

const ENDPOINT = "https://photon.komoot.io/api";

type PhotonProperties = {
  osm_type?: string;
  osm_id?: number;
  osm_key?: string;
  osm_value?: string;
  name?: string;
  housenumber?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  /** Photon extent order: [minLon, maxLat, maxLon, minLat]. */
  extent?: [number, number, number, number];
};

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: PhotonProperties;
};

function featureName(props: PhotonProperties): string {
  if (props.name) return props.name;
  if (props.street) {
    return props.housenumber
      ? `${props.street} ${props.housenumber}`
      : props.street;
  }
  return props.city ?? props.country ?? "Unknown place";
}

function featureAddress(
  props: PhotonProperties,
  name: string,
): string | undefined {
  const parts = [props.city, props.state, props.country].filter(
    (part): part is string => Boolean(part) && part !== name,
  );
  return parts.length > 0 ? parts.join(", ") : undefined;
}

function toResult(feature: PhotonFeature, index: number): GeocodeResult {
  const props = feature.properties;
  const name = featureName(props);
  const extent = props.extent;
  return {
    id:
      props.osm_type && props.osm_id != null
        ? `${props.osm_type}:${props.osm_id}`
        : `photon:${index}`,
    name,
    address: featureAddress(props, name),
    placeType: props.osm_value ?? props.osm_key,
    center: feature.geometry.coordinates,
    // Photon's extent is [minLon, maxLat, maxLon, minLat]; reorder to
    // [west, south, east, north].
    bbox: extent ? [extent[0], extent[3], extent[2], extent[1]] : undefined,
    raw: feature,
  };
}

/**
 * Photon (photon.komoot.io) — free OSM geocoder built for search-as-you-type.
 * Fair-use public instance; point `search` at a self-hosted Photon for
 * production traffic by supplying a custom provider instead.
 */
export const photon: GeocodingProvider = {
  id: "photon",
  attribution: "Search data © OpenStreetMap contributors",
  minQueryLength: 2,
  debounceMs: 300,
  async search(query, options) {
    const params = new URLSearchParams({ q: query });
    if (options.limit != null) params.set("limit", String(options.limit));
    if (options.language) params.set("lang", options.language);
    if (options.proximity) {
      params.set("lon", String(options.proximity[0]));
      params.set("lat", String(options.proximity[1]));
    }
    const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
      signal: options.signal,
    });
    if (!response.ok) {
      throw new Error(`photon: HTTP ${response.status}`);
    }
    const data = (await response.json()) as { features?: PhotonFeature[] };
    return (data.features ?? []).map(toResult);
  },
};

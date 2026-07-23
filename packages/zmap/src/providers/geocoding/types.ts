import type { LngLatTuple } from "../../utils/geojson";

/** One place returned by a geocoding provider. */
export type GeocodeResult = {
  /** Stable id within the provider, e.g. "N:240109189". */
  id: string;
  /** Primary label, e.g. "Berlin". */
  name: string;
  /** Secondary label, e.g. "Berlin, Germany". */
  address?: string;
  /** The provider's place type, e.g. "city" or "street". */
  placeType?: string;
  /** Result position as [lng, lat]. */
  center: LngLatTuple;
  /** Bounding box as [west, south, east, north], when the provider has one. */
  bbox?: [number, number, number, number];
  /** The provider's raw result object, for anything the mapping drops. */
  raw?: unknown;
};

/** Options passed to GeocodingProvider.search. */
export type GeocodeOptions = {
  /** Abort signal — a newer request aborts the previous one. */
  signal: AbortSignal;
  /** Maximum number of results to return. */
  limit?: number;
  /** Preferred result language (provider-specific, e.g. "en"). */
  language?: string;
  /** Bias results toward this [lng, lat] (ignored by providers without bias support). */
  proximity?: LngLatTuple;
};

/** A pluggable geocoding backend for GeocoderControl / useGeocoder. */
export interface GeocodingProvider {
  /** Unique provider id, e.g. "photon". */
  id: string;
  /** Fetch places matching the query. */
  search(query: string, options: GeocodeOptions): Promise<GeocodeResult[]>;
  /** Attribution required by the data source, if any. */
  attribution?: string;
  /** Minimum trimmed query length before searching. Default 2. */
  minQueryLength?: number;
  /** Milliseconds to debounce between typing and the request. Default 300. */
  debounceMs?: number;
}

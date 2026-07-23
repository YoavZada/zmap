import { nominatim } from "./nominatim";
import { photon } from "./photon";
import type { GeocodingProvider } from "./types";

/** Built-in geocoding providers, keyed by id. */
export const geocoders = { photon, nominatim } as const;

/** Id of a built-in geocoding provider. */
export type GeocoderId = keyof typeof geocoders;

/** A built-in provider id or a custom GeocodingProvider implementation. */
export type GeocoderInput = GeocoderId | GeocodingProvider;

/** Resolve a built-in id, or pass a custom provider through unchanged. */
export function resolveGeocoder(input: GeocoderInput): GeocodingProvider {
  return typeof input === "string" ? geocoders[input] : input;
}

export { photon } from "./photon";
export { nominatim } from "./nominatim";
export type {
  GeocodeOptions,
  GeocodeResult,
  GeocodingProvider,
} from "./types";

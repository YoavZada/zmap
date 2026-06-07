import type { StyleSpecification } from "maplibre-gl";
import type { ColorMode, MapProvider } from "./types";
import { carto } from "./carto";
import { osm } from "./osm";
import { versatiles } from "./versatiles";
import { opentopomap } from "./opentopomap";

/** Built-in providers, keyed by id. */
export const providers = { carto, osm, versatiles, opentopomap } as const;

export type ProviderId = keyof typeof providers;

/**
 * Anything accepted by the `provider` prop:
 * a built-in id, a custom MapProvider, a raw style URL, or a full style spec.
 */
export type MapStyleInput =
  | ProviderId
  | (string & {})
  | MapProvider
  | StyleSpecification;

function isMapProvider(input: unknown): input is MapProvider {
  return (
    typeof input === "object" &&
    input !== null &&
    typeof (input as MapProvider).getStyle === "function"
  );
}

/** A stable key for the provider, used to detect when a style swap is needed. */
export function providerKey(input: MapStyleInput): string {
  if (typeof input === "string") return `id:${input}`;
  if (isMapProvider(input)) return `provider:${input.id}`;
  return "style:custom";
}

/** Resolves the `provider` prop + color mode into a MapLibre style. */
export function resolveStyle(
  input: MapStyleInput,
  mode: ColorMode,
): string | StyleSpecification {
  if (typeof input === "string") {
    if (input in providers)
      return providers[input as ProviderId].getStyle(mode);
    return input; // raw style URL
  }
  if (isMapProvider(input)) return input.getStyle(mode);
  return input; // full StyleSpecification
}

/** The attribution string for a provider input, when one is known. */
export function resolveAttribution(input: MapStyleInput): string | undefined {
  if (typeof input === "string" && input in providers) {
    return providers[input as ProviderId].attribution;
  }
  if (isMapProvider(input)) return input.attribution;
  return undefined;
}

export { carto } from "./carto";
export { osm } from "./osm";
export { versatiles } from "./versatiles";
export { opentopomap } from "./opentopomap";
export { maptiler } from "./maptiler";
export type { ColorMode, MapProvider };

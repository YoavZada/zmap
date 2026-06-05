import type { StyleSpecification } from "maplibre-gl";

/** The effective color mode a basemap is rendered in. */
export type ColorMode = "light" | "dark";

/**
 * A pluggable basemap source. Implement this to add any MapLibre-compatible
 * provider (MapTiler, Stadia, self-hosted, …) beyond the built-ins.
 */
export interface MapProvider {
  /** Stable identifier, used as a cache key for style swaps. */
  id: string;
  /** A MapLibre style URL or full style spec for the requested color mode. */
  getStyle(mode: ColorMode): string | StyleSpecification;
  /** Attribution shown on the map. Required by most tile usage policies. */
  attribution?: string;
}

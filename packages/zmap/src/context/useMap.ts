import { useContext } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { MapContext, type MapContextValue } from "./MapContext";

/** Reads the full map context. Throws if used outside <Map>. */
export function useMapContext(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) {
    throw new Error("zmap: this component must be rendered inside <Map>.");
  }
  return ctx;
}

/**
 * Returns the underlying MapLibre GL map instance, or null until it is ready.
 * Use this to drop down to the raw MapLibre API whenever you need more control.
 */
export function useMap(): MapLibreMap | null {
  return useMapContext().map;
}

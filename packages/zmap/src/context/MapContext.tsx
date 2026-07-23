import { createContext } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

/** The value provided by `<Map>` through `MapContext`. */
export interface MapContextValue {
  /** The underlying MapLibre GL instance (null until created). */
  map: MapLibreMap | null;
  /** True once the map's "load" event has fired. */
  loaded: boolean;
}

export const MapContext = createContext<MapContextValue | null>(null);

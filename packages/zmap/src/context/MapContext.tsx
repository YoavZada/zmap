import { createContext } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

/** Where a map error came from. */
export type MapErrorKind =
  | "init"
  | "runtime"
  | "tile"
  | "layer"
  | "style"
  | "webgl";

/** The value provided by `<Map>` through `MapContext`. */
export interface MapContextValue {
  /** The underlying MapLibre GL instance (null until created). */
  map: MapLibreMap | null;
  /** True once the map's "load" event has fired. */
  loaded: boolean;
  /**
   * Internal: route a caught failure to `<Map onError>`. Optional so bare
   * `{ map, loaded }` values still type-check.
   */
  reportError?: (error: Error, kind: MapErrorKind) => void;
}

export const MapContext = createContext<MapContextValue | null>(null);

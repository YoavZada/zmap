import "maplibre-gl/dist/maplibre-gl.css";

// Components
export { default as Map } from "./components/Map";
export type { MapProps, MapViewState } from "./components/Map";
export { default as Marker } from "./components/Marker";
export type { MarkerProps } from "./components/Marker";
export { default as Popup } from "./components/Popup";
export type { PopupProps } from "./components/Popup";
export { default as Tooltip } from "./components/Tooltip";
export type { TooltipProps } from "./components/Tooltip";
export { default as MapControls } from "./components/MapControls";
export type { MapControlsProps, ControlPosition } from "./components/MapControls";
export { default as Route } from "./components/Route";
export type { RouteProps } from "./components/Route";
export { default as Arc } from "./components/Arc";
export type { ArcProps } from "./components/Arc";
export { default as Cluster } from "./components/Cluster";
export type { ClusterPoint, ClusterProps } from "./components/Cluster";
export { default as GeoJSONLayer } from "./components/GeoJSONLayer";
export type { GeoJSONLayerProps } from "./components/GeoJSONLayer";

// Hooks & context
export { useMap, useMapContext } from "./context/useMap";
export type { MapContextValue } from "./context/MapContext";
export { useMapLayer } from "./hooks/useMapLayer";
export type { MapLayerConfig, LayerInput } from "./hooks/useMapLayer";
export { useColorScheme } from "./hooks/useColorScheme";
export type { ColorScheme } from "./hooks/useColorScheme";

// Providers
export {
  providers,
  resolveStyle,
  resolveAttribution,
  providerKey,
} from "./providers";
export type {
  MapProvider,
  MapStyleInput,
  ProviderId,
  ColorMode,
} from "./providers";
export { carto } from "./providers/carto";
export { osm } from "./providers/osm";

// Utils
export { generateArc } from "./utils/arc";
export type { ArcOptions, ArcType } from "./utils/arc";
export { lineFeature, pointFeature, featureCollection } from "./utils/geojson";
export type { LngLatTuple } from "./utils/geojson";
export { resolvePaletteColor } from "./utils/color";

// Re-export the underlying MapLibre namespace for power users.
export { default as maplibregl } from "maplibre-gl";

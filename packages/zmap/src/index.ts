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
export type {
  MapControlsProps,
  ControlPosition,
} from "./components/MapControls";
export { default as Route } from "./components/Route";
export type { RouteProps } from "./components/Route";
export { default as Arc } from "./components/Arc";
export type { ArcProps } from "./components/Arc";
export { default as Cluster } from "./components/Cluster";
export type { ClusterPoint, ClusterProps } from "./components/Cluster";
export { default as GeoJSONLayer } from "./components/GeoJSONLayer";
export type { GeoJSONLayerProps } from "./components/GeoJSONLayer";
export { default as Layer } from "./components/Layer";
export type { LayerProps } from "./components/Layer";
export { default as LayerControl } from "./components/LayerControl";
export type {
  LayerControlProps,
  LayerConfig,
  LayerItemControls,
} from "./components/LayerControl";
export { default as PointLayer } from "./components/PointLayer";
export type { PointLayerProps, LayerPoint } from "./components/PointLayer";
export { default as HeatmapLayer } from "./components/HeatmapLayer";
export type { HeatmapLayerProps } from "./components/HeatmapLayer";
export { default as ShapeLayer } from "./components/ShapeLayer";
export type { ShapeLayerProps } from "./components/ShapeLayer";
export { default as Legend } from "./components/Legend";
export type { LegendProps, LegendItem } from "./components/Legend";
export { default as ChoroplethLayer } from "./components/ChoroplethLayer";
export type {
  ChoroplethLayerProps,
  ChoroplethLegendConfig,
} from "./components/ChoroplethLayer";
export { default as ExtrusionLayer } from "./components/ExtrusionLayer";
export type { ExtrusionLayerProps } from "./components/ExtrusionLayer";
export { default as HexbinLayer } from "./components/HexbinLayer";
export type { HexbinLayerProps } from "./components/HexbinLayer";
export { default as TimePlayback } from "./components/TimePlayback";
export type { TimePlaybackProps } from "./components/TimePlayback";
export { default as DrawControl } from "./components/DrawControl";
export type { DrawControlProps } from "./components/DrawControl";
export { default as MeasureControl } from "./components/MeasureControl";
export type {
  MeasureControlProps,
  MeasureMode,
} from "./components/MeasureControl";
export { default as ContextMenu } from "./components/ContextMenu";
export type {
  ContextMenuProps,
  ContextMenuItem,
  ContextMenuItemContext,
} from "./components/ContextMenu";
export { default as SelectControl } from "./components/SelectControl";
export type {
  SelectControlProps,
  SelectTool,
} from "./components/SelectControl";

// Hooks & context
export { useMap, useMapContext } from "./context/useMap";
export type { MapContextValue } from "./context/MapContext";
export { useMapLayer } from "./hooks/useMapLayer";
export type { MapLayerConfig, LayerInput } from "./hooks/useMapLayer";
export { useColorScheme } from "./hooks/useColorScheme";
export type { ColorScheme } from "./hooks/useColorScheme";
export {
  useLayerRegistry,
  useLayerVisibility,
} from "./context/useLayerRegistry";
export type {
  LayerEntry,
  LayerRegistryValue,
} from "./context/LayerRegistryContext";
export { useDraw } from "./hooks/useDraw";
export type {
  DrawMode,
  DrawFeature,
  DrawFeatureProperties,
  DrawEngine,
  UseDrawOptions,
} from "./hooks/useDraw";

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
export { versatiles } from "./providers/versatiles";
export { opentopomap } from "./providers/opentopomap";
export { maptiler } from "./providers/maptiler";

// Utils
export { generateArc } from "./utils/arc";
export type { ArcOptions, ArcType } from "./utils/arc";
export { lineFeature, pointFeature, featureCollection } from "./utils/geojson";
export type { LngLatTuple } from "./utils/geojson";
export { resolvePaletteColor } from "./utils/color";
export { buildColorExpression, isChoroplethSpec } from "./utils/choropleth";
export type { ChoroplethSpec } from "./utils/choropleth";
export { binPoints } from "./utils/bin";
export type {
  BinPoint,
  BinOptions,
  BinProperties,
  BinnedFeatureCollection,
} from "./utils/bin";
export {
  haversineDistance,
  lineDistance,
  polygonArea,
  formatDistance,
  formatArea,
} from "./utils/measure";
export type { MeasureUnit } from "./utils/measure";
export { pointInPolygon, pointInBox } from "./utils/geometry";
export type { ScreenPoint } from "./utils/geometry";

// Re-export the underlying MapLibre namespace for power users.
export { default as maplibregl } from "maplibre-gl";

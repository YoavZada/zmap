import type { FC } from "react";
import { useMapLayer, type MapLayerConfig } from "../hooks/useMapLayer";

export type GeoJSONLayerProps = MapLayerConfig;

/**
 * Low-level escape hatch: declaratively add a GeoJSON source + layers, kept
 * alive across theme-driven style swaps. Build Route/Arc/Cluster-style features
 * yourself when the higher-level components don't fit.
 */
const GeoJSONLayer: FC<GeoJSONLayerProps> = (props) => {
  useMapLayer(props);
  return null;
};

export default GeoJSONLayer;

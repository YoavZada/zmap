import { type FC, useId, useMemo } from "react";
import { useRasterLayer } from "../../hooks/useRasterLayer";
import { applyLayerOverrides, type LayerOverride } from "../../utils/layerOverrides";

/** Props for `<RasterLayer>`, which renders XYZ/WMS raster tiles as a layer. */
export type RasterLayerProps = {
  /** Shared source/layer id. Auto-generated when omitted. */
  id?: string;
  /** XYZ tile URL template(s). */
  tiles?: string | string[];
  /** Alias for a single tile URL template. */
  url?: string;
  /** Tile size in px. Default 256. */
  tileSize?: number;
  /** Raster opacity, 0–1. Default 1. */
  opacity?: number;
  /** Attribution shown for this source. */
  attribution?: string;
  /** Insert the layer before this existing layer id. */
  beforeId?: string;
  /** Per-role paint/layout patch for the raster layer. */
  layerOverrides?: { raster?: LayerOverride };
  /** Escape hatch merged into the raster source spec (WMS, bounds, min/maxzoom). */
  sourceOptions?: Record<string, unknown>;
};

/** Renders raster tiles (XYZ/WMS) as a MapLibre `raster` layer. */
const RasterLayer: FC<RasterLayerProps> = ({
  id,
  tiles,
  url,
  tileSize = 256,
  opacity = 1,
  attribution,
  beforeId,
  layerOverrides,
  sourceOptions,
}) => {
  const reactId = useId();
  const baseId = id ?? `zmap-raster-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const tileList = useMemo(() => {
    const t = tiles ?? url;
    if (!t) return [];
    return Array.isArray(t) ? t : [t];
  }, [tiles, url]);

  // Fold any layerOverrides for the "raster" role into the layer's paint.
  const paint = useMemo(() => {
    const [layer] = applyLayerOverrides(
      [{ id: `${baseId}-raster`, type: "raster", paint: {} }],
      layerOverrides,
    );
    return (layer as { paint?: Record<string, unknown> }).paint;
  }, [baseId, layerOverrides]);

  useRasterLayer({
    id: baseId,
    tiles: tileList,
    tileSize,
    opacity,
    attribution,
    beforeId,
    paint,
    sourceOptions,
  });
  return null;
};

export default RasterLayer;

import { useCallback } from "react";
import type {
  Map as MapLibreMap,
  RasterLayerSpecification,
  RasterSourceSpecification,
} from "maplibre-gl";
import { useMapContext } from "../context/useMap";
import { useStyleReapply } from "./useStyleReapply";

/** Declarative raster source + layer config consumed by `useRasterLayer`. */
export interface RasterLayerConfig {
  /** Shared id for the raster source and layer. */
  id: string;
  /** XYZ tile URL templates. */
  tiles: string[];
  /** Tile size in px. Default 256. */
  tileSize?: number;
  /** Raster opacity, 0–1. Default 1. */
  opacity?: number;
  /** Attribution shown for this source. */
  attribution?: string;
  /** Insert the layer before this existing layer id. */
  beforeId?: string;
  /** Extra raster paint properties merged into the layer. */
  paint?: Record<string, unknown>;
  /** Escape hatch merged into the raster source spec. */
  sourceOptions?: Partial<
    Omit<RasterSourceSpecification, "type" | "tiles" | "url">
  >;
}

/**
 * Adds a raster tile source + layer and keeps them alive across theme-driven
 * style swaps (via `useStyleReapply`). Paint (`opacity`, `paint` overrides) is
 * re-applied in place whenever it changes, so those props are reactive; the
 * source itself (`tiles`, `tileSize`, `beforeId`, …) is mount-oriented and
 * only recreated after a style swap wipes it. Removes both on unmount.
 */
export function useRasterLayer(config: RasterLayerConfig): void {
  const { map, loaded } = useMapContext();
  const {
    id,
    tiles,
    tileSize = 256,
    opacity = 1,
    attribution,
    beforeId,
    paint,
    sourceOptions,
  } = config;

  // biome-ignore lint/correctness/useExhaustiveDependencies: tiles/paint compared by serialized content
  const apply = useCallback(
    (m: MapLibreMap) => {
      if (!m.getSource(id)) {
        m.addSource(id, {
          type: "raster",
          tiles,
          tileSize,
          ...(attribution ? { attribution } : {}),
          ...sourceOptions,
        } as RasterSourceSpecification);
      }
      const resolvedPaint = { "raster-opacity": opacity, ...paint };
      if (!m.getLayer(id)) {
        const before = beforeId && m.getLayer(beforeId) ? beforeId : undefined;
        m.addLayer(
          {
            id,
            type: "raster",
            source: id,
            paint: resolvedPaint,
          } as RasterLayerSpecification,
          before,
        );
      }
      // Apply paint unconditionally (mirrors useMapLayer's in-place update) so
      // opacity/layerOverrides changes take effect on an already-added layer,
      // not just at creation. A no-op on the just-added-layer path above, since
      // addLayer already set these values.
      for (const [key, value] of Object.entries(resolvedPaint)) {
        m.setPaintProperty(id, key, value);
      }
    },
    [
      id,
      tiles.join("|"),
      tileSize,
      opacity,
      attribution,
      beforeId,
      JSON.stringify(paint),
      sourceOptions,
    ],
  );

  const cleanup = useCallback(
    (m: MapLibreMap) => {
      if (m.getLayer(id)) m.removeLayer(id);
      if (m.getSource(id)) m.removeSource(id);
    },
    [id],
  );

  useStyleReapply(map, loaded, apply, cleanup);
}

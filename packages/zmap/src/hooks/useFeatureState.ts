import { useEffect, useState } from "react";
import type { MapGeoJSONFeature, MapLayerMouseEvent } from "maplibre-gl";
import { useMapContext } from "../context/useMap";

/** Options for `useFeatureState`. */
export interface FeatureStateOptions {
  /** Layer id to track pointer hover on. */
  layer: string;
  /** Source id backing that layer — feature-state is written to the source. */
  source: string;
  /** Feature-state key set to `true` on the hovered feature. Default "hover". */
  stateKey?: string;
  /** Show a pointer cursor while a feature is hovered. Default true. */
  pointerCursor?: boolean;
}

/**
 * Tracks pointer hover over a layer and mirrors it into MapLibre
 * feature-state, so paint expressions can react per feature:
 *
 * ```ts
 * "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.9, 0.5]
 * ```
 *
 * Returns the hovered feature (or null). Features need stable ids for
 * feature-state — pass `sourceOptions: { generateId: true }` (or `promoteId`)
 * to the layer rendering them.
 */
export function useFeatureState(
  options: FeatureStateOptions,
): MapGeoJSONFeature | null {
  const { map } = useMapContext();
  const { layer, source, stateKey = "hover", pointerCursor = true } = options;
  const [hovered, setHovered] = useState<MapGeoJSONFeature | null>(null);

  useEffect(() => {
    if (!map) return;
    let currentId: string | number | undefined;

    // The style (and all feature-state) may already be gone during cleanup or
    // right after a theme swap — clearing is always best-effort.
    const clear = () => {
      if (currentId === undefined) return;
      try {
        map.removeFeatureState({ source, id: currentId }, stateKey);
      } catch {
        /* style swapped or source removed — nothing to clear */
      }
      currentId = undefined;
    };

    const onMove = (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature || feature.id === undefined) return;
      if (feature.id === currentId) return;
      clear();
      currentId = feature.id;
      try {
        map.setFeatureState({ source, id: feature.id }, { [stateKey]: true });
      } catch {
        /* source not ready yet */
      }
      if (pointerCursor) map.getCanvas().style.cursor = "pointer";
      setHovered(feature);
    };

    const onLeave = () => {
      clear();
      if (pointerCursor) map.getCanvas().style.cursor = "";
      setHovered(null);
    };

    map.on("mousemove", layer, onMove);
    map.on("mouseleave", layer, onLeave);
    return () => {
      map.off("mousemove", layer, onMove);
      map.off("mouseleave", layer, onLeave);
      onLeave();
    };
  }, [map, layer, source, stateKey, pointerCursor]);

  return hovered;
}

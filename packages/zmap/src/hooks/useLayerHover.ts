import { useEffect, useRef } from "react";
import type { MapGeoJSONFeature, MapLayerMouseEvent } from "maplibre-gl";
import { useMapContext } from "../context/useMap";

/** Options for the internal `useLayerHover` hook. */
export interface LayerHoverOptions {
  /** Layer ids to listen on (the component's sub-layers, e.g. fill + line). */
  layerIds: string[];
  /** Source id — feature-state is written to the source. */
  sourceId: string;
  /** Mirror hover into feature-state `{ [stateKey]: true }` on the hovered feature. Default false. */
  featureState?: boolean;
  /** Feature-state key. Default "hover". */
  stateKey?: string;
  /** Show a pointer cursor while hovering. Default true. */
  pointerCursor?: boolean;
  /** Hovered feature (null on leave) plus the raw MapLibre event. */
  onHover?: (
    feature: MapGeoJSONFeature | null,
    event: MapLayerMouseEvent,
  ) => void;
}

/**
 * Internal: subscribes mousemove/mouseleave on one or more layer ids and
 * calls `onHover` with the hovered feature (null on leave), optionally
 * mirroring hover into MapLibre feature-state so paint expressions can react
 * per feature. Subscribes nothing when neither `onHover` nor `featureState`
 * is set.
 *
 * Returns void on purpose — returning React state would re-render the layer
 * on every hovered feature; `useFeatureState` remains the public stateful
 * hook for consumers who want hover state in their own render tree.
 */
export function useLayerHover(options: LayerHoverOptions): void {
  const { map } = useMapContext();
  const {
    layerIds,
    sourceId,
    featureState = false,
    stateKey = "hover",
    pointerCursor = true,
    onHover,
  } = options;
  const onHoverRef = useRef(onHover);
  onHoverRef.current = onHover;
  const enabled = onHover !== undefined || featureState;

  // biome-ignore lint/correctness/useExhaustiveDependencies: layerIds is an array — keyed by its joined value (layerIds.join("|")) instead of the array identity, per the hook's documented re-subscribe contract
  useEffect(() => {
    if (!map || !enabled) return;
    let currentId: string | number | undefined;

    // The style (and all feature-state) may already be gone during cleanup or
    // right after a theme swap — clearing is always best-effort.
    const clear = () => {
      if (currentId === undefined) return;
      if (featureState) {
        try {
          map.removeFeatureState({ source: sourceId, id: currentId }, stateKey);
        } catch {
          /* style swapped or source removed — nothing to clear */
        }
      }
      currentId = undefined;
    };

    const onMove = (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature || feature.id === undefined) return;
      if (feature.id === currentId) return;
      clear();
      currentId = feature.id;
      if (featureState) {
        try {
          map.setFeatureState(
            { source: sourceId, id: feature.id },
            { [stateKey]: true },
          );
        } catch {
          /* source not ready yet */
        }
      }
      if (pointerCursor) map.getCanvas().style.cursor = "pointer";
      onHoverRef.current?.(feature, e);
    };

    // A layer-scoped "mouseleave" only tells us the pointer left THAT
    // layer's hit area — with multiple layerIds sharing one source (e.g.
    // fill + line), the pointer can still be over a different one of our
    // layers on the same feature (mousemove on it just hasn't fired yet, or
    // never will if the shapes overlap exactly). Query what's actually under
    // the pointer across all of our layerIds before clearing, so a stale
    // sibling-layer mouseleave can't wipe a hover that's still current.
    const stillHoveringCurrentFeature = (e: MapLayerMouseEvent): boolean => {
      if (currentId === undefined) return false;
      if (typeof map.queryRenderedFeatures !== "function") return false;
      try {
        const hits = map.queryRenderedFeatures(e?.point, {
          layers: layerIds,
        });
        return hits.some((f) => f.id === currentId);
      } catch {
        return false;
      }
    };

    const onLeave = (e: MapLayerMouseEvent) => {
      if (stillHoveringCurrentFeature(e)) return;
      clear();
      // Kept in sync with useLayerClick's cursor restore — see the comment
      // there for why this reads `zmapCursor` instead of clearing outright.
      if (pointerCursor) {
        const canvas = map.getCanvas();
        canvas.style.cursor = canvas.dataset.zmapCursor ?? "";
      }
      onHoverRef.current?.(null, e);
    };

    // A theme swap wipes feature-state along with the layers; forget the
    // tracked id so the next mousemove re-applies it instead of deduping
    // against a feature that's no longer actually marked as hovered.
    const onStyleData = () => {
      currentId = undefined;
    };

    for (const layerId of layerIds) {
      map.on("mousemove", layerId, onMove);
      map.on("mouseleave", layerId, onLeave);
    }
    map.on("styledata", onStyleData);

    return () => {
      for (const layerId of layerIds) {
        map.off("mousemove", layerId, onMove);
        map.off("mouseleave", layerId, onLeave);
      }
      map.off("styledata", onStyleData);
    };
  }, [
    map,
    enabled,
    featureState,
    layerIds.join("|"),
    sourceId,
    stateKey,
    pointerCursor,
  ]);
}

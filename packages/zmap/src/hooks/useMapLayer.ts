import { useEffect, useRef } from "react";
import type {
  GeoJSONSource,
  GeoJSONSourceSpecification,
  LayerSpecification,
  Map as MapLibreMap,
} from "maplibre-gl";
import type { GeoJSON } from "geojson";
import { useMapContext } from "../context/useMap";

/**
 * Omit that distributes over a union instead of collapsing it to common keys —
 * a plain `Omit<LayerSpecification, …>` would silently drop variant-specific
 * fields like `filter` and the per-type `paint`/`layout` shapes.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

/** A layer spec where `source` is optional (filled from the config id). */
export type LayerInput = DistributiveOmit<LayerSpecification, "source"> & {
  source?: string;
};

/** Declarative GeoJSON source + layers config consumed by `useMapLayer`. */
export interface MapLayerConfig {
  /** Unique id for the GeoJSON source backing these layers. */
  id: string;
  /**
   * GeoJSON rendered by the layers — inline data, or a URL string the map
   * fetches itself (any endpoint serving GeoJSON).
   */
  data: GeoJSON | string;
  /** Extra source options (clustering, generateId, …). */
  sourceOptions?: Partial<Omit<GeoJSONSourceSpecification, "type" | "data">>;
  /** One or more layers to render. Memoize this array to avoid churn. */
  layers: LayerInput[];
  /** Insert the layers before this existing layer id (e.g. a label layer). */
  beforeId?: string;
}

function addAll(map: MapLibreMap, cfg: MapLayerConfig) {
  if (!map.getSource(cfg.id)) {
    map.addSource(cfg.id, {
      type: "geojson",
      data: cfg.data,
      ...cfg.sourceOptions,
    });
  }
  const before =
    cfg.beforeId && map.getLayer(cfg.beforeId) ? cfg.beforeId : undefined;
  for (const layer of cfg.layers) {
    if (map.getLayer(layer.id)) continue;
    map.addLayer(
      { ...layer, source: layer.source ?? cfg.id } as LayerSpecification,
      before,
    );
  }
}

function removeAll(map: MapLibreMap, cfg: MapLayerConfig) {
  // The map instance may already be torn down by the time this cleanup runs —
  // e.g. the parent <Map> reset its instance (map.remove() + setMap(null)) while
  // these layers were still mounted, or during HMR / StrictMode re-invocation.
  // Touching a removed map throws ("Cannot read properties of undefined
  // (reading 'getLayer')" — its internal style is gone), so bail out.
  if (!map || (map as { _removed?: boolean })._removed) return;
  try {
    for (const layer of cfg.layers) {
      if (map.getLayer(layer.id)) map.removeLayer(layer.id);
    }
    if (map.getSource(cfg.id)) map.removeSource(cfg.id);
  } catch {
    // Style already gone — nothing left to clean up.
  }
}

/**
 * Adds a GeoJSON source + layers to the map and keeps them alive across
 * theme-driven style swaps (MapLibre's `setStyle` wipes custom layers, so we
 * re-add on `styledata`). Data and paint/layout updates are applied in place.
 */
export function useMapLayer(config: MapLayerConfig): void {
  const { map, loaded } = useMapContext();
  const { id, data, layers, beforeId } = config;

  // The re-add path reads the *latest* config from a ref: layers restored
  // after a theme swap must carry the current paint (the swap itself usually
  // changed it), not whatever the mount-time render computed.
  const cfgRef = useRef(config);
  cfgRef.current = config;

  // Add on load + re-add after every style reload. Keyed by source id only.
  //
  // Two events guard the re-add: `styledata` covers the common case, but a
  // style swap's *final* styledata can fire while isStyleLoaded() is still
  // false (sprite/glyphs pending) — with no later styledata, the layers would
  // be lost until something else touched the style. `idle` fires once the map
  // settles, so it reliably sweeps up that race.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-add is keyed by map/loaded; id is included to rebind if it changes
  useEffect(() => {
    if (!map || !loaded) return;
    // A bad source/layer spec must fail in isolation, not crash the React
    // tree — log and move on instead of rethrowing.
    try {
      addAll(map, cfgRef.current);
    } catch (err) {
      console.error("zmap: failed to apply a map layer/source", err);
    }

    const ensure = () => {
      if (!map.getSource(cfgRef.current.id) && map.isStyleLoaded()) {
        try {
          addAll(map, cfgRef.current);
        } catch (err) {
          console.error("zmap: failed to apply a map layer/source", err);
        }
      }
    };
    map.on("styledata", ensure);
    map.on("idle", ensure);

    return () => {
      map.off("styledata", ensure);
      map.off("idle", ensure);
      removeAll(map, cfgRef.current);
    };
  }, [map, loaded, id]);

  // Update GeoJSON data in place.
  useEffect(() => {
    if (!map || !loaded) return;
    const src = map.getSource(id) as GeoJSONSource | undefined;
    if (src && typeof src.setData === "function") {
      src.setData(data as never);
    }
  }, [map, loaded, id, data]);

  // Re-anchor when `beforeId` changes after mount — addAll only honors it at
  // insertion time, so a later change must move the layers explicitly.
  useEffect(() => {
    if (!map || !loaded || !beforeId) return;
    if (!map.getLayer(beforeId)) return;
    for (const layer of layers) {
      if (map.getLayer(layer.id)) map.moveLayer(layer.id, beforeId);
    }
  }, [map, loaded, beforeId, layers]);

  // Update paint/layout in place when layer specs change.
  useEffect(() => {
    if (!map || !loaded) return;
    for (const layer of layers) {
      if (!map.getLayer(layer.id)) continue;
      const paint = (layer as { paint?: Record<string, unknown> }).paint;
      if (paint) {
        for (const [k, v] of Object.entries(paint)) {
          map.setPaintProperty(layer.id, k as never, v as never);
        }
      }
      const layout = (layer as { layout?: Record<string, unknown> }).layout;
      if (layout) {
        for (const [k, v] of Object.entries(layout)) {
          map.setLayoutProperty(layer.id, k as never, v as never);
        }
      }
    }
  }, [map, loaded, layers]);
}

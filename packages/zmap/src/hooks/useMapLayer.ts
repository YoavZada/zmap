import { useEffect } from "react";
import type {
  GeoJSONSource,
  GeoJSONSourceSpecification,
  LayerSpecification,
  Map as MapLibreMap,
} from "maplibre-gl";
import type { GeoJSON } from "geojson";
import { useMapContext } from "../context/useMap";

/** A layer spec where `source` is optional (filled from the config id). */
export type LayerInput = Omit<LayerSpecification, "source"> & {
  source?: string;
};

export interface MapLayerConfig {
  /** Unique id for the GeoJSON source backing these layers. */
  id: string;
  /** GeoJSON data rendered by the layers. */
  data: GeoJSON;
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
  const { id, data, layers } = config;

  // Add on load + re-add after every style reload. Keyed by source id only.
  useEffect(() => {
    if (!map || !loaded) return;
    // `config` is captured fresh on each (id-keyed) run; that is enough because
    // data/layout changes are handled by the in-place effects below.
    const cfg = config;
    addAll(map, cfg);

    const onStyleData = () => {
      if (!map.getSource(cfg.id) && map.isStyleLoaded()) addAll(map, cfg);
    };
    map.on("styledata", onStyleData);

    return () => {
      map.off("styledata", onStyleData);
      removeAll(map, cfg);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, loaded, id]);

  // Update GeoJSON data in place.
  useEffect(() => {
    if (!map || !loaded) return;
    const src = map.getSource(id) as GeoJSONSource | undefined;
    if (src && typeof src.setData === "function") {
      src.setData(data as never);
    }
  }, [map, loaded, id, data]);

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

import type { LayerInput } from "../hooks/useMapLayer";

/**
 * Paint/layout patches merged into a component-generated layer spec — the
 * escape hatch when a high-level prop doesn't exist for a MapLibre property.
 * Entries win over component-computed values.
 */
export type LayerOverride = {
  /** Paint property patches, merged over the generated paint object. */
  paint?: Record<string, unknown>;
  /** Layout property patches, merged over the generated layout object. */
  layout?: Record<string, unknown>;
};

/** Derives the override key from a layer id: the suffix after the last "-". */
function defaultRoleOf(layerId: string): string {
  return layerId.slice(layerId.lastIndexOf("-") + 1);
}

/**
 * Shallow-merges per-role overrides into generated layer specs. Because
 * useMapLayer re-applies paint/layout whenever the layers array changes,
 * overrides update in place and survive theme-driven style swaps.
 */
export function applyLayerOverrides<K extends string>(
  layers: LayerInput[],
  overrides: Partial<Record<K, LayerOverride>> | undefined,
  roleOf: (layerId: string) => string = defaultRoleOf,
): LayerInput[] {
  if (!overrides) return layers;
  return layers.map((layer) => {
    const override = overrides[roleOf(layer.id) as K];
    if (!override) return layer;
    const base = layer as {
      paint?: Record<string, unknown>;
      layout?: Record<string, unknown>;
    };
    const merged: Record<string, unknown> = { ...layer };
    if (base.paint || override.paint) {
      merged.paint = { ...base.paint, ...override.paint };
    }
    if (base.layout || override.layout) {
      merged.layout = { ...base.layout, ...override.layout };
    }
    return merged as LayerInput;
  });
}

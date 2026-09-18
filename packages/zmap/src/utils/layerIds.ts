/**
 * Sub-layer roles each layer component generates, in render order. The
 * MapLibre layer id is `${id}-${role}`; `role` is also the key for
 * `layerOverrides`. HexbinLayer's `extruded` mode emits only `-fill` (a
 * `fill-extrusion` layer, not the flat `fill` + `line` pair).
 */
export const LAYER_ROLES = {
  PointLayer: ["circle"],
  ShapeLayer: ["fill", "line"],
  ChoroplethLayer: ["fill", "line"],
  HexbinLayer: ["fill", "line"],
  ExtrusionLayer: ["extrusion"],
  SymbolLayer: ["symbol"],
  HeatmapLayer: ["heat"],
  Route: ["line"],
  Arc: ["line"],
  TimePlayback: ["trail", "head"],
} as const;

/** A zmap layer component name with a documented `LAYER_ROLES` entry. */
export type LayerComponentName = keyof typeof LAYER_ROLES;

/**
 * MapLibre layer ids a zmap layer component generates for an explicit `id`,
 * e.g. `layerIds("ShapeLayer", "zones")` → `["zones-fill", "zones-line"]`.
 */
export function layerIds(component: LayerComponentName, id: string): string[] {
  return LAYER_ROLES[component].map((role) => `${id}-${role}`);
}

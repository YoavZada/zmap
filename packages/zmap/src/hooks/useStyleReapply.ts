import { useCallback, useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

/**
 * Run `apply` once the map is loaded, on every subsequent change to `apply`'s
 * identity, and after every style swap. MapLibre's `setStyle` (fired on
 * theme/provider change) wipes the whole style document — custom layers,
 * terrain, sky, and projection — so anything added imperatively must be
 * restored. Mirrors the dual-event guard `useMapLayer` uses: `styledata`
 * covers the common case, and `idle` sweeps up the race where a swap's final
 * `styledata` fires while `isStyleLoaded()` is still false.
 *
 * `apply` MUST be idempotent: it is invoked on mount, whenever a caller passes
 * a new `apply` identity (e.g. a memoized callback whose deps changed — this
 * is what makes prop-driven updates like `<Map projection>` or `<Terrain
 * exaggeration>` take effect immediately instead of waiting for a map event),
 * and on every subsequent `styledata`/`idle` while the style is loaded — so
 * re-adding an existing source/terrain has to be a guarded no-op. The
 * `styledata`/`idle` subscription is keyed on `[map, loaded]` only: it reads
 * `apply`/`cleanup` from refs, so changing their identity never resubscribes
 * the listeners.
 */
export function useStyleReapply(
  map: MapLibreMap | null,
  loaded: boolean,
  apply: (map: MapLibreMap) => void,
  cleanup?: (map: MapLibreMap) => void,
): void {
  const applyRef = useRef(apply);
  applyRef.current = apply;
  const cleanupRef = useRef(cleanup);
  cleanupRef.current = cleanup;

  // A bad source/layer spec must fail in isolation, not crash the React tree —
  // log and move on instead of rethrowing. Stable identity (empty deps; reads
  // the latest `apply` via `applyRef`) so including it below never changes how
  // often the effects re-run.
  const safeApply = useCallback((m: MapLibreMap) => {
    try {
      applyRef.current(m);
    } catch (err) {
      console.error("zmap: failed to apply a map layer/source", err);
    }
  }, []);

  // Subscribe to style reloads once per map; re-add on styledata/idle. Keyed on
  // [map, loaded] only, so changing apply/cleanup identity never resubscribes.
  useEffect(() => {
    if (!map || !loaded) return;
    const ensure = () => {
      if (map.isStyleLoaded()) safeApply(map);
    };
    map.on("styledata", ensure);
    map.on("idle", ensure);
    return () => {
      map.off("styledata", ensure);
      map.off("idle", ensure);
      cleanupRef.current?.(map);
    };
  }, [map, loaded, safeApply]);

  // Apply on mount and whenever the (memoized) apply changes — so prop-driven
  // updates take effect immediately, without waiting for a map event. `apply`
  // is read via `applyRef` (always current) purely so this effect body never
  // closes over a stale callback; it is still a deliberate dependency here —
  // that's what makes the effect re-run when the caller passes a new identity.
  // biome-ignore lint/correctness/useExhaustiveDependencies: apply is intentionally a dep (triggers re-apply on identity change) though the body reads it via ref
  useEffect(() => {
    if (map && loaded) safeApply(map);
  }, [map, loaded, apply, safeApply]);
}

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

/**
 * Run `apply` once the map is loaded, then re-run it after every style swap.
 * MapLibre's `setStyle` (fired on theme/provider change) wipes the whole style
 * document — custom layers, terrain, sky, and projection — so anything added
 * imperatively must be restored. Mirrors the dual-event guard `useMapLayer`
 * uses: `styledata` covers the common case, and `idle` sweeps up the race where
 * a swap's final `styledata` fires while `isStyleLoaded()` is still false.
 *
 * `apply` MUST be idempotent: it is invoked on mount and on every subsequent
 * `styledata`/`idle` while the style is loaded, so re-adding an existing
 * source/terrain has to be a guarded no-op. `apply`/`cleanup` are read from
 * refs, so changing their identity does not resubscribe the listeners.
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

  useEffect(() => {
    if (!map || !loaded) return;
    applyRef.current(map);

    const ensure = () => {
      if (map.isStyleLoaded()) applyRef.current(map);
    };
    map.on("styledata", ensure);
    map.on("idle", ensure);

    return () => {
      map.off("styledata", ensure);
      map.off("idle", ensure);
      cleanupRef.current?.(map);
    };
  }, [map, loaded]);
}

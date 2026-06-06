import { useContext } from "react";
import {
  LayerRegistryContext,
  type LayerRegistryValue,
} from "./LayerRegistryContext";

/** Reads the layer registry. Throws if used outside <Map>. */
export function useLayerRegistry(): LayerRegistryValue {
  const ctx = useContext(LayerRegistryContext);
  if (!ctx) {
    throw new Error(
      "zmap: <Layer>/<LayerControl> must be rendered inside <Map>.",
    );
  }
  return ctx;
}

/**
 * Returns whether a layer id is currently visible, falling back to
 * `defaultVisible` until the layer has registered.
 */
export function useLayerVisibility(id: string, defaultVisible = true): boolean {
  const v = useLayerRegistry().isVisible(id);
  return v === undefined ? defaultVisible : v;
}

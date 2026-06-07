import type { MapProvider } from "./types";

/**
 * MapTiler basemaps — the natural production upgrade from the keyless built-ins.
 * Requires a (free-tier) API key from https://cloud.maptiler.com. Because it's
 * key'd, it's a factory rather than a bare provider const: call it with your key
 * and pass the result to the `provider` prop.
 *
 * ```ts
 * <Map provider={maptiler(import.meta.env.VITE_MAPTILER_KEY)} />
 * ```
 *
 * MapTiler ships explicit light/dark style pairs (the `*-dark` suffix), so the
 * map tracks the MUI theme. `style` defaults to "dataviz", which has both a
 * `dataviz-light` and `dataviz-dark`; pass another base ("streets-v2",
 * "basic-v2", "backdrop", …) that also exposes a `-light`/`-dark` pair.
 */
export const maptiler = (apiKey: string, style = "dataviz"): MapProvider => ({
  id: `maptiler:${style}`,
  getStyle: (mode) =>
    `https://api.maptiler.com/maps/${style}-${mode}/style.json?key=${apiKey}`,
  attribution:
    '© <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a>, ' +
    '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
});

import type { MapProvider } from "./types";

const CARTO_STYLE_URLS = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
} as const;

/**
 * CARTO basemaps — free, no API key for development. "positron" is the light
 * style, "dark-matter" the dark one, so the map tracks the MUI theme nicely.
 *
 * Note: CARTO's default basemaps require an Enterprise plan for commercial use.
 * Swap to another provider via the `provider` prop when you ship to production.
 */
export const carto: MapProvider = {
  id: "carto",
  getStyle: (mode) => CARTO_STYLE_URLS[mode],
  attribution:
    '© <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>, ' +
    '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
};

import type { MapProvider } from "./types";

const VERSATILES_STYLE_URLS = {
  light: "https://tiles.versatiles.org/assets/styles/colorful/style.json",
  dark: "https://tiles.versatiles.org/assets/styles/eclipse/style.json",
} as const;

/**
 * VersaTiles basemaps — free, open, no API key and no signup. Vector tiles
 * built from OpenStreetMap data and served from a community CDN. "colorful" is
 * the light style and "eclipse" the dark one, so the map tracks the MUI theme
 * the same way CARTO's positron/dark-matter pair does — but with no usage
 * restrictions for commercial use.
 */
export const versatiles: MapProvider = {
  id: "versatiles",
  getStyle: (mode) => VERSATILES_STYLE_URLS[mode],
  attribution:
    '© <a href="https://versatiles.org/" target="_blank" rel="noopener">VersaTiles</a>, ' +
    '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
};

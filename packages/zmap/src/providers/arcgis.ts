import type { MapProvider } from "./types";

/**
 * Known style names on Esri's ArcGIS Basemap Styles service (v2). Any other
 * string is accepted too — the service adds styles faster than we can list them.
 *
 * `arcgis/*` styles are built on Esri's authoritative data (TomTom, Garmin,
 * FAO, NOAA, USGS, OSM, …); `open/*` styles are built on Overture Maps / OSM.
 */
export type ArcgisStyle =
  | "arcgis/light-gray"
  | "arcgis/dark-gray"
  | "arcgis/streets"
  | "arcgis/streets-night"
  | "arcgis/streets-relief"
  | "arcgis/navigation"
  | "arcgis/navigation-night"
  | "arcgis/human-geography"
  | "arcgis/human-geography-dark"
  | "arcgis/topographic"
  | "arcgis/outdoor"
  | "arcgis/oceans"
  | "arcgis/terrain"
  | "arcgis/imagery"
  | "arcgis/imagery/standard"
  | "arcgis/imagery/labels"
  | "arcgis/charted-territory"
  | "arcgis/colored-pencil"
  | "arcgis/community"
  | "arcgis/midcentury"
  | "arcgis/modern-antique"
  | "arcgis/newspaper"
  | "arcgis/nova"
  | "open/light-gray"
  | "open/dark-gray"
  | "open/streets"
  | "open/streets-night"
  | "open/streets-relief"
  | "open/navigation"
  | "open/navigation-dark"
  | "open/osm-style"
  | "open/osm-style-relief"
  | "open/blueprint"
  | "open/hybrid"
  | (string & {});

/** An explicit light/dark style pair, for when the built-in pairing isn't what you want. */
export type ArcgisStylePair = { light: ArcgisStyle; dark: ArcgisStyle };

/**
 * Presentation preferences forwarded to the Basemap Styles service as query
 * parameters. See Esri's docs for the accepted values of each.
 */
export type ArcgisOptions = {
  /** Label language — an ISO code like `"fr"` or `"zh-CN"`, or `"global"` / `"local"`. */
  language?: string;
  /** Whose view of disputed borders to draw, e.g. `"unitedStatesOfAmerica"`, `"morocco"`. */
  worldview?: string;
  /** Place labels (POIs) — `"all"`, `"attributed"` or `"none"`. `arcgis/*` styles only. */
  places?: "all" | "attributed" | "none" | (string & {});
};

const ARCGIS_STYLES_BASE =
  "https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles";

/** Light styles that have a dedicated dark counterpart. Everything else reuses itself. */
const DARK_TWIN: Readonly<Record<string, string>> = {
  "arcgis/light-gray": "arcgis/dark-gray",
  "arcgis/streets": "arcgis/streets-night",
  "arcgis/navigation": "arcgis/navigation-night",
  "arcgis/human-geography": "arcgis/human-geography-dark",
  "open/light-gray": "open/dark-gray",
  "open/streets": "open/streets-night",
  "open/navigation": "open/navigation-dark",
};

/**
 * Esri ArcGIS basemaps via the ArcGIS Basemap Styles service (v2). Requires
 * an ArcGIS Location Platform API key (free tier available) from
 * https://developers.arcgis.com. Like `maptiler`, it's a factory rather than a
 * bare provider const: call it with your key and pass the result to `provider`.
 *
 * ```tsx
 * <Map provider={arcgis(import.meta.env.VITE_ARCGIS_KEY)} />
 * <Map provider={arcgis(key, "arcgis/streets", { language: "fr" })} />
 * <Map provider={arcgis(key, { light: "arcgis/topographic", dark: "arcgis/nova" })} />
 * ```
 *
 * `style` defaults to `"arcgis/light-gray"`. The map tracks the MUI theme by
 * pairing a style with its dark twin (`light-gray` ↔ `dark-gray`, `streets` ↔
 * `streets-night`, `navigation` ↔ `navigation-night`, `human-geography` ↔
 * `human-geography-dark`, and the `open/*` equivalents). Styles without a twin
 * (imagery, topographic, oceans, the creative styles, …) render the same in
 * both modes; pass an explicit `{ light, dark }` pair to choose your own.
 *
 * The service embeds the token in the returned style's tile, glyph and sprite
 * URLs, so a plain style URL is all MapLibre needs. A missing or invalid key
 * surfaces as a 401 through `<Map onError>`. Esri's basemap *sessions* billing
 * model and viewport-aware attribution need their `@esri/maplibre-arcgis`
 * plugin and are not handled here.
 */
export const arcgis = (
  apiKey: string,
  style: ArcgisStyle | ArcgisStylePair = "arcgis/light-gray",
  options: ArcgisOptions = {},
): MapProvider => {
  const light = typeof style === "string" ? style : style.light;
  const dark =
    typeof style === "string" ? (DARK_TWIN[style] ?? style) : style.dark;

  const prefs = new URLSearchParams();
  if (options.language) prefs.set("language", options.language);
  if (options.worldview) prefs.set("worldview", options.worldview);
  if (options.places) prefs.set("places", options.places);
  const prefsQs = prefs.toString();

  const url = (name: string) => {
    const query = new URLSearchParams({ token: apiKey });
    for (const [k, v] of prefs) query.set(k, v);
    return `${ARCGIS_STYLES_BASE}/${name}?${query}`;
  };

  return {
    // Value-derived and key-free: this drives the style-swap effect in <Map>.
    id: `arcgis:${light}|${dark}${prefsQs ? `?${prefsQs}` : ""}`,
    getStyle: (mode) => url(mode === "dark" ? dark : light),
    attribution:
      'Powered by <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a> — ' +
      "Esri, TomTom, Garmin, FAO, NOAA, USGS, " +
      '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors, ' +
      "and the GIS User Community",
  };
};

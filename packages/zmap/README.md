# zmapgl

**MUI-native map components built on [MapLibre GL](https://maplibre.org/).**

[![npm version](https://img.shields.io/npm/v/zmapgl.svg)](https://www.npmjs.com/package/zmapgl)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/YoavZada/zmap/blob/main/LICENSE)
[![types: TypeScript](https://img.shields.io/badge/types-TypeScript-3178C6.svg)](https://yoavzada.github.io/zmap/api)

zmapgl gives [Material UI](https://mui.com/) apps a set of composable,
theme-aware map components — the map equivalent of the MUI components you
already use. Markers, popups, controls, data layers, clustering, drawing and
measuring tools, all rendered through MUI and wired into your theme (including
automatic light/dark basemaps).

📚 **Docs & live demos:** <https://yoavzada.github.io/zmap>

## Install

```bash
npm install zmapgl @mui/material @mui/icons-material \
  @emotion/react @emotion/styled
```

`react`, `react-dom`, MUI and Emotion are peer dependencies; `maplibre-gl`
ships as a regular dependency. Add the map stylesheet once, in your app
entry (Vite `main.tsx`, Next.js root layout, …):

```ts
import "zmapgl/styles.css";
```

## Quick start

```tsx
import type { FC } from "react";
import { Map, MapControls, Marker } from "zmapgl";

const MyMap: FC = () => {
  return (
    <Map center={[-0.1276, 51.5072]} zoom={11} sx={{ height: 420 }}>
      <MapControls position="top-right" />
      <Marker longitude={-0.1276} latitude={51.5072} />
    </Map>
  );
};

export default MyMap;
```

Wrap your app in an MUI `ThemeProvider` as usual — zmapgl reads the theme for
colors and to switch the basemap between light and dark. Color props accept
MUI palette tokens (`color="primary.main"`) as well as CSS colors.

## Components

### Core

| Component     | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| `Map`         | Container; creates the MapLibre instance and provides context. |
| `Marker`      | Render any MUI content at a coordinate (portal-based).         |
| `Popup`       | Theme-aware popup anchored to a coordinate.                    |
| `Tooltip`     | Lightweight, non-interactive label (a Popup variant).          |
| `MapControls` | MUI zoom / compass / geolocate / fullscreen / scale cluster.   |

### Lines & shapes

| Component      | Purpose                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `Route`        | Draw a polyline from coordinates.                                                                  |
| `Arc`          | Draw a curved (bezier or great-circle) line between two points.                                    |
| `ShapeLayer`   | GeoJSON polygons / lines, with optional choropleth fill.                                           |
| `GeoJSONLayer` | Low-level escape hatch for custom sources + layers. `data` accepts inline GeoJSON or a URL string. |

### Data visualization

| Component         | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `PointLayer`      | Render many points as a single GPU circle layer.           |
| `SymbolLayer`     | GPU text labels (+ optional icon), auto-decluttered.       |
| `HeatmapLayer`    | Render points as a density heatmap.                        |
| `Cluster`         | Native MapLibre clustering rendered as themed MUI markers. |
| `ChoroplethLayer` | Data-driven polygon fill with an optional synced legend.   |
| `ExtrusionLayer`  | 3D extruded prisms, constant or property-driven height.    |
| `HexbinLayer`     | Aggregate points into hex/square bins, optionally 3D.      |
| `TimePlayback`    | Animate time-stamped points with an MUI transport bar.     |
| `Legend`          | Themed legend (gradient, step, or categorical).            |

### Layer management & interaction

| Component        | Purpose                                                      |
| ---------------- | ------------------------------------------------------------ |
| `Layer`          | Register a toggleable overlay; pairs with `LayerControl`.    |
| `LayerControl`   | Collapsible MUI panel that toggles registered layers on/off. |
| `DrawControl`    | Point / line / polygon drawing palette.                      |
| `MeasureControl` | Distance and area measuring tool.                            |
| `ContextMenu`    | Right-click menu with built-in or custom actions.            |
| `SelectControl`  | Box / lasso marquee selection over a `PointLayer`.           |

### Hover

Every GL layer component (`PointLayer`, `ShapeLayer`, `ChoroplethLayer`,
`HexbinLayer`, `ExtrusionLayer`, `SymbolLayer`) supports `onHover(feature,
index, event)` and `hoverHighlight` (`true` for theme defaults, or explicit
colors/opacity) — backed by a stable per-feature id via `featureId`, or the
default `generateId` when you don't need one of your own.

## Hooks

| Hook                     | Purpose                                                     |
| ------------------------ | ----------------------------------------------------------- |
| `useMap()`               | The raw MapLibre instance (or `null` before it exists).     |
| `useMapContext()`        | `{ map, loaded }` — gate work behind `loaded`.              |
| `useMapLayer()`          | Add a source + layers that survive theme/style swaps.       |
| `useDraw()`              | Headless drawing state machine behind `DrawControl`.        |
| `useFeatureState()`      | Mirror pointer hover into feature-state for paint effects.  |
| `useColorScheme()`       | The resolved `"light"` / `"dark"` scheme of the map.        |
| `useLayerVisibility(id)` | Read/toggle one registered layer's visibility.              |
| `useLayerRegistry()`     | The full toggleable-layer registry (powers `LayerControl`). |

## Events & camera

The everyday MapLibre events are props — no manual listener wiring:

```tsx
<Map
  onClick={(e) => console.log(e.lngLat)}
  onMoveEnd={(view) => setLastView(view)} // center, zoom, bearing, pitch
/>
```

`center` / `zoom` / `initialView` are initial-only. To move the camera after
mount, change the `view` prop — the map eases to it (or jumps, with
`animate={false}`), the user can still pan freely in between, and feeding
`onMoveEnd`'s view state back into `view` doesn't loop. `fitBounds` refits
declaratively whenever its value changes:

```tsx
<Map
  view={selectedCity.view}
  fitBounds={showAll ? allMarkersBounds : undefined}
  fitBoundsOptions={{ padding: 40 }}
/>
```

Other constructor/reactive props worth knowing about: `transformRequest`
(rewrite tile/style/glyph/sprite requests — auth headers, signed URLs),
`maxBounds` (reactive pan constraint), `cooperativeGestures` (require
Ctrl/Cmd + scroll to zoom), `hash` (sync the camera to the URL), `cursor`
(reactive CSS cursor over the canvas), and `preserveDrawingBuffer` (keep the
WebGL buffer so `canvas.toDataURL()` works, for screenshots/export).

Failures of every kind route through one prop: `onError(error, kind)`, where
`kind` is `"init" | "runtime" | "tile" | "layer" | "style" | "webgl"` — tile
errors are deduped per source for 5 seconds so a flaky/blocked host can't
flood your handler. `fallback` renders in place of the map on an init failure
and while the WebGL context is lost (children remount once it's restored).

## Providers & theming

Switch basemaps with the `provider` prop. Built-ins: `"carto"` (default),
`"osm"`, `"versatiles"`, `"opentopomap"` — all keyless — plus `maptiler` and
`arcgis` factories for key'd styles:

```tsx
<Map provider="carto" />   {/* default — positron / dark-matter, theme-aware */}
<Map provider="osm" />     {/* OpenStreetMap raster */}

{/* MapTiler (needs a free API key) — a factory, not a bare provider: */}
import { maptiler } from "zmapgl";
<Map provider={maptiler(import.meta.env.VITE_MAPTILER_KEY, "dataviz")} />

{/* Esri ArcGIS Basemap Styles (needs a free ArcGIS Location Platform key): */}
import { arcgis } from "zmapgl";
<Map provider={arcgis(import.meta.env.VITE_ARCGIS_KEY)} />               {/* light-gray ↔ dark-gray */}
<Map provider={arcgis(key, "arcgis/streets", { language: "fr" })} />     {/* streets ↔ streets-night */}
<Map provider={arcgis(key, { light: "arcgis/topographic", dark: "arcgis/nova" })} />

{/* Anything MapLibre-compatible: */}
<Map provider="https://tiles.example.com/style.json" />
<Map provider={myStyleSpecification} />
```

`arcgis` pairs a style with its dark twin automatically (`light-gray` ↔
`dark-gray`, `streets` ↔ `streets-night`, `navigation` ↔ `navigation-night`,
`human-geography` ↔ `human-geography-dark`, and the `open/*` equivalents);
styles without a twin (imagery, topographic, oceans, …) render the same in
both modes unless you pass an explicit `{ light, dark }`. `language`,
`worldview` and `places` preferences go in the third argument. For Esri's
viewport-aware attribution or basemap *sessions* billing, use their
[`@esri/maplibre-arcgis`](https://developers.arcgis.com/maplibre-gl-js/) plugin
directly instead.

Bring your own provider by implementing `MapProvider`:

```ts
import type { MapProvider } from "zmapgl";

export const myTiles: MapProvider = {
  id: "my-tiles",
  getStyle: (mode) =>
    `https://tiles.example.com/${mode === "dark" ? "dark" : "light"}/style.json`,
  attribution: "© My Tiles",
};
```

`colorScheme` controls light/dark: `"auto"` (default, follows the MUI theme),
`"light"`, or `"dark"`. Theme swaps are handled for you — zmapgl layers
re-add themselves after the basemap style changes.

## Localization & RTL

Every user-visible string is `localeText` — override any subset, or pass a
ship-ready locale (`enUS`, `heIL`); unset keys fall back to `enUS`.
`numberLocale` is a separate BCP-47 tag for number formatting (the scale bar,
`formatDistance`/`formatArea`). For Hebrew/Arabic, MapLibre's RTL text
plugin is loaded automatically whenever the nearest MUI theme has
`direction: "rtl"` (or force it with `rtlTextPlugin`):

```tsx
import { Map, MapControls, heIL } from "zmapgl";

<ThemeProvider theme={createTheme({ direction: "rtl" })}>
  <div dir="rtl">
    <Map localeText={heIL} numberLocale="he-IL">
      <MapControls position="top-right" />
    </Map>
  </div>
</ThemeProvider>
```

zmap's own controls use logical `insetInlineStart`/`insetInlineEnd`, so they
mirror off that `dir="rtl"` ancestor automatically — `top-right` renders on
the visual left. See the
[Localization & RTL guide](https://yoavzada.github.io/zmap/guides/i18n) for
the full picture, including a live example.

## Utilities

Pure helpers, all exported: `generateArc` (curved line coordinates),
`lineFeature` / `pointFeature` / `featureCollection` (GeoJSON builders),
`binPoints` (hex/square binning), `haversineDistance` / `lineDistance` /
`polygonArea` / `formatDistance` / `formatArea` (measuring),
`pointInPolygon` / `pointInBox` (hit-testing), `resolvePaletteColor` (MUI
palette token → CSS color), `buildColorExpression` / `isChoroplethSpec`
(choropleth expressions).

## Dropping down to MapLibre

zmapgl stays close to MapLibre. Grab the instance whenever you need the raw
API — the full `maplibregl` namespace is also re-exported:

```tsx
import { useEffect, type FC } from "react";
import { useMap } from "zmapgl";

const FitBounds: FC = () => {
  const map = useMap();
  useEffect(() => {
    map?.fitBounds([
      [-10, 35],
      [40, 60],
    ]);
  }, [map]);
  return null;
};

export default FitBounds;
```

## Testing

zmapgl ships the same `FakeMap` test double the library's own ~50 test files
use, as the `zmapgl/testing` subpath (requires [vitest](https://vitest.dev/)).
It's an in-memory stand-in for maplibre-gl's `Map`/`Marker`/`Popup` — real
MapLibre can't run in jsdom (WebGL, workers). `zmapgl/testing` is Vitest
only, not Jest/CJS — it's published ESM-only and built on Vitest's `vi`, so
`require("zmapgl/testing")` throws:

```ts
import { render, act } from "@testing-library/react";
import { vi } from "vitest";
import { lastFakeMap } from "zmapgl/testing";
import { Map } from "zmapgl";

vi.mock("maplibre-gl", () => import("zmapgl/testing"));

render(<Map center={[-0.1276, 51.5072]} zoom={11} />);
act(() => lastFakeMap().fire("load"));

lastFakeMap().fireLayer("click", "my-layer-circle", { features: [] });
```

`lastFakeMap()` returns the most recently constructed instance; drive it with
`fire(event, payload)` for map-level events and `fireLayer(event, layerId,
payload)` for layer-scoped ones. GL layer components (`PointLayer`,
`ShapeLayer`, …) generate predictable per-role layer ids via `layerIds()` —
use it to target the right sub-layer (e.g. `-circle`, `-fill`) instead of
guessing suffixes.

## License

MIT. CARTO's default basemaps require an Enterprise plan for commercial use —
switch providers before shipping to production. ArcGIS basemaps are metered
against your ArcGIS Location Platform account and require Esri attribution
(set on the provider for you).

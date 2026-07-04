# zmapgl

**MUI-native map components built on [MapLibre GL](https://maplibre.org/).**

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
ships as a regular dependency. The MapLibre stylesheet is imported by the
package automatically — no extra CSS import is required with Vite, Next.js, or
any bundler that handles library CSS imports. If your setup doesn't, import
the standalone stylesheet once:

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

| Component      | Purpose                                                         |
| -------------- | --------------------------------------------------------------- |
| `Route`        | Draw a polyline from coordinates.                               |
| `Arc`          | Draw a curved (bezier or great-circle) line between two points. |
| `ShapeLayer`   | GeoJSON polygons / lines, with optional choropleth fill.        |
| `GeoJSONLayer` | Low-level escape hatch for custom sources + layers.             |

### Data visualization

| Component         | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `PointLayer`      | Render many points as a single GPU circle layer.           |
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

## Hooks

| Hook                     | Purpose                                                     |
| ------------------------ | ----------------------------------------------------------- |
| `useMap()`               | The raw MapLibre instance (or `null` before it exists).     |
| `useMapContext()`        | `{ map, loaded }` — gate work behind `loaded`.              |
| `useMapLayer()`          | Add a source + layers that survive theme/style swaps.       |
| `useDraw()`              | Headless drawing state machine behind `DrawControl`.        |
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

## Providers & theming

Switch basemaps with the `provider` prop. Built-ins: `"carto"` (default),
`"osm"`, `"versatiles"`, `"opentopomap"` — all keyless — plus a `maptiler`
factory for key'd MapTiler styles:

```tsx
<Map provider="carto" />   {/* default — positron / dark-matter, theme-aware */}
<Map provider="osm" />     {/* OpenStreetMap raster */}

{/* MapTiler (needs a free API key) — a factory, not a bare provider: */}
import { maptiler } from "zmapgl";
<Map provider={maptiler(import.meta.env.VITE_MAPTILER_KEY, "dataviz")} />

{/* Anything MapLibre-compatible: */}
<Map provider="https://tiles.example.com/style.json" />
<Map provider={myStyleSpecification} />
```

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

## License

MIT. CARTO's default basemaps require an Enterprise plan for commercial use —
switch providers before shipping to production.

# zmap

**MUI-native map components built on [MapLibre GL](https://maplibre.org/).**

zmap gives [Material UI](https://mui.com/) apps a set of composable, theme-aware
map components — the map equivalent of the MUI components you already use.
Markers, popups, tooltips, controls, routes, arcs and clustering, all rendered
through MUI and wired into your theme (including automatic light/dark basemaps).

## Install

```bash
npm install zmapgl @mui/material @mui/icons-material \
  @emotion/react @emotion/styled maplibre-gl
```

`react`, `react-dom`, MUI and Emotion are peer dependencies. The MapLibre
stylesheet is imported by the package automatically — no extra CSS import is
required with Vite, Next.js, or any bundler that handles library CSS imports.

## Quick start

Components are declared as a typed `FC` arrow, default-exported:

```tsx
import type { FC } from "react";
import { Map, MapControls, Marker, Popup } from "zmapgl";

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

Wrap your app in an MUI `ThemeProvider` as usual — zmap reads the theme for
colors and to switch the basemap between light and dark.

## Components

| Component       | Purpose                                                        |
| --------------- | -------------------------------------------------------------- |
| `Map`           | Container; creates the MapLibre instance and provides context. |
| `Marker`        | Render any MUI content at a coordinate (portal-based).         |
| `Popup`         | Theme-aware popup anchored to a coordinate.                    |
| `Tooltip`       | Lightweight, non-interactive label (a Popup variant).          |
| `MapControls`   | MUI zoom / compass / geolocate / fullscreen / scale cluster.   |
| `Route`         | Draw a polyline from coordinates.                              |
| `Arc`           | Draw a curved (bezier or great-circle) line between two points.|
| `Cluster`       | Native MapLibre clustering rendered as themed MUI markers.     |
| `LayerControl`  | Collapsible MUI panel that toggles registered layers on/off.   |
| `Layer`         | Register a toggleable overlay; pairs with `LayerControl`.      |
| `PointLayer`    | Render many points as a single GPU circle layer.              |
| `HeatmapLayer`  | Render points as a density heatmap.                           |
| `ShapeLayer`    | GeoJSON polygons / lines, with optional choropleth fill.      |
| `GeoJSONLayer`  | Low-level escape hatch for custom sources + layers.            |

Hooks: `useMap()` (the raw MapLibre instance), `useMapLayer()`,
`useColorScheme()`.

## Providers & theming

Switch basemaps with the `provider` prop:

```tsx
<Map provider="carto" />   {/* default — positron / dark-matter, theme-aware */}
<Map provider="osm" />     {/* OpenStreetMap raster */}

{/* Anything MapLibre-compatible: */}
<Map provider="https://tiles.example.com/style.json" />
<Map provider={myStyleSpecification} />
```

Bring your own provider by implementing `MapProvider`:

```ts
import type { MapProvider } from "zmapgl";

export const maptiler: MapProvider = {
  id: "maptiler",
  getStyle: (mode) =>
    `https://api.maptiler.com/maps/${mode === "dark" ? "dataviz-dark" : "dataviz"}/style.json?key=YOUR_KEY`,
  attribution: "© MapTiler © OpenStreetMap contributors",
};
```

`colorScheme` controls light/dark: `"auto"` (default, follows the MUI theme),
`"light"`, or `"dark"`.

## Dropping down to MapLibre

zmap stays close to MapLibre. Grab the instance whenever you need the raw API:

```tsx
import { useEffect, type FC } from "react";
import { useMap } from "zmapgl";

const FitBounds: FC = () => {
  const map = useMap();
  useEffect(() => {
    map?.fitBounds([[-10, 35], [40, 60]]);
  }, [map]);
  return null;
};

export default FitBounds;
```

## License

MIT. CARTO's default basemaps require an Enterprise plan for commercial use —
switch providers before shipping to production.

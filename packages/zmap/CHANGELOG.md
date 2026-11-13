# Changelog

## 0.10.0

### Minor Changes

- [#19](https://github.com/YoavZada/zmap/pull/19) [`c208be0`](https://github.com/YoavZada/zmap/commit/c208be0a4235c59335020df30dbb933047c415c1) Thanks [@YoavZada](https://github.com/YoavZada)! - New `arcgis` basemap provider for Esri's ArcGIS Basemap Styles service (v2). A keyed factory like `maptiler`: `<Map provider={arcgis(apiKey)} />` defaults to `arcgis/light-gray` and tracks the MUI theme by pairing styles with their dark twins (`light-gray` ↔ `dark-gray`, `streets` ↔ `streets-night`, `navigation` ↔ `navigation-night`, `human-geography` ↔ `human-geography-dark`, and the `open/*` equivalents). Styles without a twin render the same in both modes, or pass an explicit `{ light, dark }`. Optional `language`, `worldview` and `places` preferences are forwarded as query params. The provider id never contains the API key. Exports `ArcgisStyle`, `ArcgisStylePair` and `ArcgisOptions`.

- [#20](https://github.com/YoavZada/zmap/pull/20) [`fac76d9`](https://github.com/YoavZada/zmap/commit/fac76d93d6ca55247f88cb9fc2f515d681ac8751) Thanks [@YoavZada](https://github.com/YoavZada)! - Production-hardening release: reliability (errors, WebGL loss), interaction (hover), accessibility, fullscreen, localization, and a shipped testing kit.

  **Layers**

  - `featureId` (promote a feature property via MapLibre `promoteId`) or the default `generateId` on every GeoJSON-backed layer, plus the `layerIds(component, id)` helper for predictable per-role MapLibre layer ids (e.g. `layerIds("ShapeLayer", "zones")` → `["zones-fill", "zones-line"]`).
  - `onHover(feature, index, event)` + `hoverHighlight` (theme defaults or explicit colors/opacity) on `PointLayer`, `ShapeLayer`, `ChoroplethLayer`, `HexbinLayer`, `ExtrusionLayer`, and `SymbolLayer` — backed by feature-state, so it works out of the box with the generated ids.
  - `useMapLayer`: `filter`/`minzoom`/`maxzoom` now update in place instead of remounting the layer; the layer still remounts when its shape (source type, layer roles) or `source` actually changes.

  **Map**

  - `onError(error, kind)` — one prop for every failure kind (`"init" | "runtime" | "tile" | "layer" | "style" | "webgl"`); tile errors dedupe per source for 5 seconds. `fallback` now also covers WebGL context loss (children remount once the context is restored), not just init failures.
  - New constructor/reactive props: `transformRequest`, `preserveDrawingBuffer`, `maxBounds` (reactive), `minPitch`/`maxPitch` (reactive), `cooperativeGestures`, `hash`, `cursor` (reactive), plus a typed `mapOptions` escape hatch. `interactive` is now reactive.
  - A forwarded ref now exposes the raw `maplibregl.Map` instance (`MapRef`).
  - New event props: `onIdle`, `onZoom`, `onStyleLoad`, `onMouseMove`, `onResize`. Note: `onMouseMove` now receives the MapLibre `MapMouseEvent` (with `lngLat`) instead of the DOM event — it is omitted from the pass-through Box props like `onClick` already was.
  - `locale` passes MapLibre's own UI-string overrides (attribution toggle, cooperative-gesture hint) to the constructor — distinct from `localeText`, which covers zmap's strings.

  **Popup**

  - Popup: an X-closed uncontrolled popup now really closes (previously it stayed logically open and could never reopen); `defaultOpen` added; `offset`/`maxWidth`/`className` update in place; `anchor`/`closeButton`/`closeOnClick`/`closeOnMove` are reactive.

  **Controls**

  - Fullscreen-safe overlays: control tooltips, `ContextMenu`, and the geocoder result list now portal into the map's own root node instead of `document.body`, so they stay visible when the map enters the Fullscreen API. Their poppers use the `fixed` positioning strategy so the map's `overflow: hidden` cannot clip them. Build your own overlay on the same primitive via the newly-exported `usePortalContainer()`.

  **Localization & RTL**

  - `localeText` (partial override; merges over the default) translates every built-in string — tooltips, aria-labels, menu items, legend text, the transport bar. Ship-ready locales: `enUS`, `heIL`.
  - `numberLocale` (BCP-47) for number formatting in the scale bar and `MeasureControl`; `formatDistance`/`formatArea` gained a `locale` and `units` option and are exported directly, alongside `localeUnitLabels()`.
  - `rtlTextPlugin` loads MapLibre's RTL text plugin, on by default whenever the nearest MUI theme has `direction: "rtl"` (or force it / pass a custom URL); `registerRtlTextPlugin()` is exported for manual control.
  - **Behavior change:** floating controls (`MapControls`, `ContextMenu`, tooltips) now use logical `insetInlineStart`/`insetInlineEnd` instead of physical `left`/`right`, so under `dir="rtl"` they mirror — `top-left` renders on the visual right, matching what an RTL layout expects.

  **Testing**

  - The `FakeMap`/`FakeMarker`/`FakePopup` test double the library's own suite runs against is now published as `zmapgl/testing` (requires Vitest — it's ESM-only, so `require("zmapgl/testing")` throws under Jest/CJS).

  **Other**

  - `"use client"` is now written directly in source (`src/index.ts`), not just added by tsup's build banner, so source-aliased monorepo consumers (e.g. a Next.js app with `transpilePackages` pointed at `src/`) work in RSC too.

## 0.9.0

### Minor Changes

- [#17](https://github.com/YoavZada/zmap/pull/17) [`66cad68`](https://github.com/YoavZada/zmap/commit/66cad68e1e7aaa8dfef032a95bdb1806bcff082e) Thanks [@YoavZada](https://github.com/YoavZada)! - Accessibility, error resilience, and a live playground.

  **Accessibility** — `<Map>` now exposes a `region` role; `<Popup>` is a labeled dialog with focus management and Escape-to-close (new `ariaLabel` prop); `Legend`, `LayerControl` groups, and the `TimePlayback` speed control are properly labeled; `Marker` and `Cluster` markers expose accessible names. Draw/Measure/Select are now keyboard-operable — pan with the arrow keys and press Space to place a vertex (or box-selection corner) at the map center.

  **Error resilience** — `<Map>` gains `onError` and `fallback`: a map that fails to initialize (e.g. no WebGL) renders a themed fallback panel instead of crashing the app, runtime map errors are surfaced through `onError`, and a bad layer/source now fails in isolation rather than tearing down the whole map.

  **Playground** — a new `/playground` docs page with a live, editable Sandpack example.

- [#17](https://github.com/YoavZada/zmap/pull/17) [`6eb6304`](https://github.com/YoavZada/zmap/commit/6eb630495e39392f8d81660a20e855d01ac6267a) Thanks [@YoavZada](https://github.com/YoavZada)! - Optional `<Map loader>`: a themed loading indicator shown while the map initializes, off by default. Pass `loader` to enable the built-in one and shape it with `loaderProps` — `variant` (`"overlay"` frosted screen, `"spinner"`, or `"bar"`), `label`, a controlled `progress` (0–100, else indeterminate), and spinner `size` — or pass a ReactNode to `loader` for a fully custom indicator. The built-in loader cross-fades out as the map paints in (respecting `prefers-reduced-motion`), sets `aria-busy` on the map region while loading, and exposes a `role="status"` live region. All new props/types carry full JSDoc.

## 0.8.0

### Minor Changes

- [#15](https://github.com/YoavZada/zmap/pull/15) [`45dc488`](https://github.com/YoavZada/zmap/commit/45dc488992c8ca7b75fb42a964d2a166b24c4568) Thanks [@YoavZada](https://github.com/YoavZada)! - Basemap & 3D: globe projection (`<Map projection="globe">`), 3D terrain (`<Terrain>`, defaulting to a free elevation tileset, with optional sky), raster tile layers (`<RasterLayer>` for XYZ/WMS), and PMTiles support (`registerPmtilesProtocol()`, auto-registered by `<Map>` on a `pmtiles://` style). All new props/types carry full JSDoc.

## 0.7.0

### Minor Changes

- [#12](https://github.com/YoavZada/zmap/pull/12) [`761af99`](https://github.com/YoavZada/zmap/commit/761af99e918bcde935c82ba19ba0ae28c910c823) Thanks [@YoavZada](https://github.com/YoavZada)! - New `GeocoderControl`: MUI Autocomplete place search on the map with pluggable geocoding providers — built-in `photon` (default) and `nominatim`, custom backends via the `GeocodingProvider` interface — plus fly-to/fitBounds on select, an optional result marker, and a public headless `useGeocoder` hook. All exported props and types now carry complete JSDoc, so docs prop tables and IDE hovers show a description for every field.

## 0.6.0

### Minor Changes

- [#9](https://github.com/YoavZada/zmap/pull/9) [`8ddc53e`](https://github.com/YoavZada/zmap/commit/8ddc53e25a63ceef04735d8c6bed7e94528f8deb) Thanks [@YoavZada](https://github.com/YoavZada)! - **CSS is now an explicit import.** zmapgl no longer injects MapLibre's stylesheet via a JS side-effect — add it once in your app entry (Vite `main.tsx`, Next.js root layout, etc.):

  ```ts
  import "zmapgl/styles.css";
  ```

  Why: the side-effect import made `import "zmapgl"` crash in plain Node (SSR frameworks, `react-dom/server`, Vite SSR externals), and bundler tree-shaking could silently drop it anyway. The package also now ships a `"use client"` banner, so zmapgl components can be imported directly from React Server Components.

## 0.5.1

### Patch Changes

- [#7](https://github.com/YoavZada/zmap/pull/7) [`4e0529b`](https://github.com/YoavZada/zmap/commit/4e0529b15b2030c18046873fcd71ef7cea5c12ff) Thanks [@YoavZada](https://github.com/YoavZada)! - Refresh the npm README: badges, a complete component table, and a prominent link to the docs site.

<!--
All notable changes to **zmapgl** are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project
adheres to [Semantic Versioning](https://semver.org/). Entries from 0.5.1
onward are generated by changesets.
-->

## [0.4.0] — 2026-07-19

An API-consistency release: one fill/stroke vocabulary across every layer
component, click events everywhere, render-order control, and an escape hatch
for raw MapLibre paint/layout. **Fully backwards compatible** — old prop names
keep working and warn once in dev; they'll be removed in v1.0.

### Added

- **Unified fill/stroke props** on the polygon/circle family: `fillColor` /
  `fillOpacity` for the surface, `strokeColor` / `strokeWidth` /
  `strokeOpacity` for the outline — on PointLayer, ShapeLayer,
  ChoroplethLayer, HexbinLayer, and ExtrusionLayer. PointLayer and HexbinLayer
  gain `strokeOpacity` (HexbinLayer's outline opacity was previously hardcoded
  to 0.4).
- **`beforeId` on every GL layer component** (PointLayer, SymbolLayer,
  HeatmapLayer, HexbinLayer, ShapeLayer, ChoroplethLayer, ExtrusionLayer,
  TimePlayback — Route/Arc/GeoJSONLayer already had it). Changing it after
  mount now moves the layers in place (`useMapLayer` calls `map.moveLayer`).
- **`layerOverrides` escape hatch** on every layer component: per-role
  paint/layout patches (e.g. `{ circle: { paint: { "circle-blur": 0.5 } } }`)
  deep-merged into the generated MapLibre layer specs — reach any paint
  property without dropping to `GeoJSONLayer`. New exported type
  `LayerOverride`.
- **Clicks everywhere, one shape**: every layer `onClick` now also receives
  the raw `MapLayerMouseEvent` as its last argument; **Route and Arc gain
  `onClick`** (with pointer-cursor hover). `Cluster`'s `onPointClick` now also
  receives the point's index.
- **Controlled `TimePlayback`**: `playhead` + `onTimeChange` and `playing` +
  `onPlayingChange` follow the standard controlled/uncontrolled pattern, plus
  `defaultPlayhead` for the uncontrolled start. `autoplay` stays the
  uncontrolled initial.
- **`BasePoint`** exported type — the shared `{ longitude, latitude,
properties? }` shape that `LayerPoint`, `SymbolPoint`, `ClusterPoint`, and
  `BinPoint` now all extend, so helpers can be written once.
- **`HeatmapLayer.colorRamp`** now also accepts `[density, color][]` stops
  (palette tokens allowed) — same shape as HexbinLayer's ramp — in addition to
  a raw MapLibre expression.
- **Marker accessibility**: markers with `onClick` are now keyboard-accessible
  — focusable with `role="button"`, activated by Enter/Space — and a new
  `label` prop sets their accessible name. The `Map` container carries a
  default `aria-label` (override via the usual Box props).
- JSDoc on every public prop and export (surfaced in the docs props tables,
  which now badge deprecated props).

### Deprecated

Old props keep working (new prop wins when both are set) and warn once per
prop in dev builds. Removal is planned for v1.0.

| Component       | Deprecated                              | Use instead                                   |
| --------------- | --------------------------------------- | --------------------------------------------- |
| PointLayer      | `color`, `opacity`                      | `fillColor`, `fillOpacity`                    |
| ShapeLayer      | `lineColor`, `lineWidth`, `lineOpacity` | `strokeColor`, `strokeWidth`, `strokeOpacity` |
| ChoroplethLayer | `lineColor`, `lineWidth`, `lineOpacity` | `strokeColor`, `strokeWidth`, `strokeOpacity` |
| HexbinLayer     | `opacity`, `lineColor`, `lineWidth`     | `fillOpacity`, `strokeColor`, `strokeWidth`   |
| ExtrusionLayer  | `color`, `opacity`                      | `fillColor`, `fillOpacity`                    |

(Route/Arc keep `color`/`width`/`opacity` — a line has no fill/stroke split.
SymbolLayer keeps `color` + `haloColor`; Cluster/TimePlayback/Marker keep
their domain colors.)

### Changed

- Layer `onClick` feature arguments are now typed `MapGeoJSONFeature` instead
  of `any` (ShapeLayer, ChoroplethLayer, ExtrusionLayer). Code that relied on
  the implicit `any` may need a type tweak — runtime behavior is unchanged.

### Fixed

- **Layers could vanish permanently on a theme toggle**: when a style swap's
  final `styledata` event fired before `isStyleLoaded()` turned true, the
  re-add never ran and every custom layer stayed gone. `useMapLayer` now also
  sweeps on `idle`, which reliably catches that race. Re-added layers also now
  carry the _current_ paint/layout (the re-add previously used the mount-time
  specs, so layers restored after a theme flip kept the old theme's colors).
- `resolvePaletteColor` now resolves top-level palette string entries like
  `"divider"` — previously ChoroplethLayer's default outline color reached
  MapLibre as the literal string `"divider"`.

## [0.3.0] — 2026-07-04

### Added

- **`SymbolLayer`** — text labels (optionally with an icon image loaded from a
  URL) rendered as a single GPU symbol layer, with MapLibre decluttering,
  palette-token text/halo colors, and `onClick`. Icons re-register themselves
  after theme-driven style swaps.
- **`useFeatureState`** — tracks pointer hover over a layer and mirrors it
  into MapLibre feature-state, so paint expressions can react per feature
  (`["feature-state", "hover"]`). Returns the hovered feature; handles cursor
  and cleanup.
- **GeoJSON from a URL** — `useMapLayer` / `GeoJSONLayer` `data` now also
  accepts a URL string, fetched by the map itself.
- **`clusterProperties` on `Cluster`** — aggregate point properties into each
  cluster (e.g. `{ sales: ["+", ["get", "sales"]] }`); aggregates arrive as
  `renderCluster`'s new third argument.

### Fixed

- `LayerInput` (the `useMapLayer` / `GeoJSONLayer` layer spec) no longer drops
  union-specific fields like `filter` — the `Omit` over MapLibre's layer-spec
  union now distributes over the variants instead of collapsing them to their
  common keys.

## [0.2.0] — 2026-07-04

### Added

- **Map-level event props**: `onClick`, `onDblClick`, `onContextMenu` (raw
  `MapMouseEvent` with `lngLat`), and `onMove`, `onMoveEnd`, `onZoomEnd`
  (receive the camera state as `Required<MapViewState>`). Handlers may be
  inline closures — they never re-create the map or re-subscribe.
- **Reactive camera props on `Map`**: `view` eases the camera whenever it
  changes (fields you omit are left alone; changes matching the current camera
  are ignored, so `onMoveEnd → state → view` doesn't loop), `animate`
  (`boolean | AnimationOptions`) tunes or disables the transition, and
  `fitBounds` / `fitBoundsOptions` fit declaratively when the bounds value
  changes.
- New exported type `MapViewEventHandler`.

### Changed

- `MapProps` no longer accepts the DOM `onClick` / `onDoubleClick` /
  `onContextMenu` from `BoxProps` — the map-level props above replace them.
  `center` / `zoom` / `initialView` remain initial-only by design; use `view`
  to move the camera after mount.

## [0.1.5] — 2026-07-04

### Added

- `zmapgl/styles.css` subpath export — a standalone copy of the MapLibre GL
  base CSS for consumers whose bundler doesn't process CSS imports from
  `node_modules`. Bundler users still need nothing: the library's JS entry
  imports the same CSS automatically.
- `./package.json` subpath export, `engines` (Node ≥ 18), and `publishConfig`
  metadata.
- This changelog.

### Fixed

- The build config comment previously claimed a `dist/index.css` /
  `zmap/styles.css` entry that was never actually published.

## [0.1.4] — 2026-06-07

### Changed

- All components refactored to typed `FC` arrow functions with default exports
  and colocated `*.style.ts` style files (no API changes).

## [0.1.3] — 2026-06-07

### Changed

- Docs site and Pathfinder demo hosted on GitHub Pages and cross-linked;
  npm badge/link integration. No library API changes.

## [0.1.2] — 2026-06-06

### Fixed

- Corrected the package `homepage` URL.

## [0.1.1] — 2026-06-06

### Added

- `repository`, `homepage`, and `bugs` fields in `package.json`.

## [0.1.0] — 2026-06-06

### Added

- Initial public release: `Map`, `Marker`, `Popup`, `Tooltip`, `MapControls`,
  `Route`, `Arc`, `Cluster`, `GeoJSONLayer`, `Layer`, `LayerControl`,
  `PointLayer`, `HeatmapLayer`, `ShapeLayer`, `Legend`, `ChoroplethLayer`,
  `ExtrusionLayer`, `HexbinLayer`, `TimePlayback`, `DrawControl`,
  `MeasureControl`, `ContextMenu`, `SelectControl`; hooks (`useMap`,
  `useMapLayer`, `useDraw`, `useColorScheme`, `useLayerRegistry`,
  `useLayerVisibility`); providers (`carto`, `osm`, `versatiles`,
  `opentopomap`, `maptiler`); geo utils; MUI theme integration with
  automatic light/dark basemap swapping.

[Unreleased]: https://github.com/YoavZada/zmap/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/YoavZada/zmap/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/YoavZada/zmap/compare/v0.1.5...v0.2.0
[0.1.5]: https://github.com/YoavZada/zmap/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/YoavZada/zmap/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/YoavZada/zmap/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/YoavZada/zmap/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/YoavZada/zmap/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/YoavZada/zmap/releases/tag/v0.1.0

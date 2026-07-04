# Changelog

All notable changes to **zmapgl** are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project
adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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

[Unreleased]: https://github.com/YoavZada/zmap/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/YoavZada/zmap/compare/v0.1.5...v0.2.0
[0.1.5]: https://github.com/YoavZada/zmap/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/YoavZada/zmap/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/YoavZada/zmap/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/YoavZada/zmap/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/YoavZada/zmap/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/YoavZada/zmap/releases/tag/v0.1.0

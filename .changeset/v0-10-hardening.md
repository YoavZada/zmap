---
"zmapgl": minor
---

Production-hardening release: reliability (errors, WebGL loss), interaction (hover), accessibility, fullscreen, localization, and a shipped testing kit.

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

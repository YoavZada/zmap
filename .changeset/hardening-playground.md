---
"zmapgl": minor
---

Accessibility, error resilience, and a live playground.

**Accessibility** — `<Map>` now exposes a `region` role; `<Popup>` is a labeled dialog with focus management and Escape-to-close (new `ariaLabel` prop); `Legend`, `LayerControl` groups, and the `TimePlayback` speed control are properly labeled; `Marker` and `Cluster` markers expose accessible names. Draw/Measure/Select are now keyboard-operable — pan with the arrow keys and press Space to place a vertex (or box-selection corner) at the map center.

**Error resilience** — `<Map>` gains `onError` and `fallback`: a map that fails to initialize (e.g. no WebGL) renders a themed fallback panel instead of crashing the app, runtime map errors are surfaced through `onError`, and a bad layer/source now fails in isolation rather than tearing down the whole map.

**Playground** — a new `/playground` docs page with a live, editable Sandpack example.

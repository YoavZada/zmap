---
"zmapgl": minor
---

Optional `<Map loader>`: a themed loading indicator shown while the map initializes, off by default. Pass `loader` to enable the built-in one and shape it with `loaderProps` — `variant` (`"overlay"` frosted screen, `"spinner"`, or `"bar"`), `label`, a controlled `progress` (0–100, else indeterminate), and spinner `size` — or pass a ReactNode to `loader` for a fully custom indicator. The built-in loader cross-fades out as the map paints in (respecting `prefers-reduced-motion`), sets `aria-busy` on the map region while loading, and exposes a `role="status"` live region. All new props/types carry full JSDoc.

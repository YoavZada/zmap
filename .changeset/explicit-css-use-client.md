---
"zmapgl": minor
---

**CSS is now an explicit import.** zmapgl no longer injects MapLibre's stylesheet via a JS side-effect — add it once in your app entry (Vite `main.tsx`, Next.js root layout, etc.):

```ts
import "zmapgl/styles.css";
```

Why: the side-effect import made `import "zmapgl"` crash in plain Node (SSR frameworks, `react-dom/server`, Vite SSR externals), and bundler tree-shaking could silently drop it anyway. The package also now ships a `"use client"` banner, so zmapgl components can be imported directly from React Server Components.

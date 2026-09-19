import { defineConfig } from "tsup";

export default defineConfig({
  // Both entries build in both formats (tsup applies `format` repo-wide, not
  // per entry). dist/testing/index.cjs is a harmless but unreachable
  // artifact: vitest's own CJS entry point deliberately throws ("Vitest
  // cannot be imported in a CommonJS module using require()"), and
  // mockMaplibre.ts uses `vi` at module scope, so requiring the built CJS
  // file throws too. package.json's "./testing" export has no "require"
  // condition — only "types"/"import" — so consumers can't reach it via the
  // package's public surface; only ESM is documented/tested for it.
  entry: { index: "src/index.ts", "testing/index": "src/testing/index.ts" },
  format: ["esm", "cjs"],
  // tsup/esbuild enable ESM code-splitting by default once there's more than
  // one entry point, which hoisted a shared `__publicField` class-field
  // helper (needed only by the testing entry's FakeMap/FakeMarker/FakePopup
  // classes) into a standalone chunk that dist/index.js then bare-imported
  // even though it never uses it — silently growing the main bundle past its
  // size-limit budget. false keeps every entry fully self-contained.
  splitting: false,
  // d.ts comes from `tsc -p tsconfig.build.json` (second step of the build
  // script), not tsup: dts bundling needs the legacy TypeScript JS API, which
  // the native TypeScript 7 package no longer ships.
  dts: false,
  sourcemap: true,
  clean: true,
  // false, not true: tsup's `treeshake` option re-bundles esbuild's output
  // through Rollup for extra dead-code elimination, and Rollup's bundler
  // silently drops any top-level directive other than "use strict" while
  // doing so (warns "Module level directives cause errors when bundled" and
  // strips it) — it would eat the "use client" banner below in both esm and
  // cjs output. Confirmed against this repo's resolved tsup/rollup/esbuild;
  // trades ~0.35 kB / ~0.85 kB of size-limit headroom (still comfortably
  // under budget) for a banner that's actually present in dist/.
  treeshake: false,
  // Mark the whole surface as client code so React Server Components can
  // import zmapgl directly (Next.js app router). Applied to both formats.
  banner: { js: '"use client";' },
  // CSS story (since 0.6.0): no side-effect import — consumers add
  // `import "zmapgl/styles.css"` once. copy-css.mjs publishes MapLibre's
  // stylesheet as dist/styles.css → the `zmapgl/styles.css` subpath export.
  onSuccess: "node scripts/copy-css.mjs",
  // Keep React + MUI as peers; bundle nothing of them.
  external: [
    "react",
    "react-dom",
    "@mui/material",
    "@mui/icons-material",
    "@emotion/react",
    "@emotion/styled",
    "vitest",
  ],
});

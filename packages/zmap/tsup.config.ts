import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
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
  ],
});

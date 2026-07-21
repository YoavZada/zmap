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
  treeshake: true,
  // CSS story: src/index.ts keeps a bare `import "maplibre-gl/dist/maplibre-gl.css"`
  // side-effect import (preserved in dist output) so bundler users get the map CSS
  // automatically. For everyone else, the same CSS is copied to dist/styles.css and
  // published as the `zmapgl/styles.css` subpath. (A CSS entry with @import doesn't
  // work here: tsup auto-externalizes dependencies, so the import isn't inlined.)
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

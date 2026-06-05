import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // The `maplibre-gl.css` imported in src/index.ts is bundled to dist/index.css,
  // exposed to consumers as `zmap/styles.css`.
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

// Copies the MapLibre GL base CSS to dist/styles.css, published as the
// `zmapgl/styles.css` subpath (see tsup.config.ts for the full CSS story).
import { copyFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
copyFileSync(
  require.resolve("maplibre-gl/dist/maplibre-gl.css"),
  "dist/styles.css",
);

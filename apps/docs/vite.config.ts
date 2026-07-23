import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

// Alias the published package name to the library source for live HMR during
// docs development — no build step required while iterating on components.
const zmapSrc = fileURLToPath(
  new URL("../../packages/zmap/src/index.ts", import.meta.url),
);

// Surface the library's version (its package.json is the source of truth, and
// the release workflow ties the git tag to it) so the UI can display it.
const { version } = JSON.parse(
  readFileSync(
    new URL("../../packages/zmap/package.json", import.meta.url),
    "utf-8",
  ),
) as { version: string };

export default defineConfig({
  // Served from the domain root in dev and on Netlify. The GitHub Pages build
  // sets BASE_PATH=/zmap/ (the project-site subpath) so emitted asset URLs —
  // and import.meta.env.BASE_URL, which the router's basename derives from —
  // resolve correctly under https://<user>.github.io/zmap/.
  base: process.env.BASE_PATH ?? "/",
  // svgr() enables `import Icon from "./foo.svg?react"` — SVGs as React
  // components (see src/icons). Typed via vite-plugin-svgr/client in tsconfig.
  plugins: [react(), svgr()],
  // Pinned so the pathfinder app's "Docs" link has a stable URL in dev.
  server: { port: 5173 },
  resolve: {
    alias: [
      // Blocks import the consumer-facing stylesheet; zmapgl is aliased to
      // source here (no dist), so map the subpath to MapLibre's CSS directly.
      // Exact-match and ordered before the zmapgl alias below — a bare-string
      // "zmapgl" alias would otherwise prefix-match "zmapgl/styles.css" too.
      {
        find: /^zmapgl\/styles\.css$/,
        replacement: "maplibre-gl/dist/maplibre-gl.css",
      },
      {
        find: "zmapgl",
        replacement: zmapSrc,
      },
    ],
  },
  define: {
    "import.meta.env.VITE_ZMAP_VERSION": JSON.stringify(version),
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Alias `zmap` to the library source for live HMR during development —
// no build step required while iterating on components.
const zmapSrc = fileURLToPath(
  new URL("../../packages/zmap/src/index.ts", import.meta.url),
);

export default defineConfig({
  // Served from the domain root in dev and on Netlify. The GitHub Pages build
  // sets BASE_PATH=/zmap/pathfinder/ (the app's subpath on the shared project
  // site) so emitted asset URLs resolve under
  // https://<user>.github.io/zmap/pathfinder/.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  // Pinned so the docs app's "Pathfinder" link has a stable URL in dev.
  server: { port: 5174 },
  resolve: {
    alias: {
      zmapgl: zmapSrc,
    },
  },
});

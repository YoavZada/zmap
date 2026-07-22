import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// MapLibre's stylesheet positions markers/popups (`.maplibregl-marker` is
// `position: absolute`, which shrink-wraps the overlay to its content). zmapgl
// imports it as a side effect from its barrel, but this app aliases `zmapgl` to
// the library *source* and `packages/zmap`'s `sideEffects: ["**/*.css"]` marks
// that barrel side-effect-free — so Vite's production build tree-shakes the
// bare CSS import and markers render unstyled (full-width, mispositioned).
// Import it here explicitly, exactly as a real consumer would.
import "maplibre-gl/dist/maplibre-gl.css";
import { AppThemeProvider } from "./theme";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// MapLibre's stylesheet positions markers/popups (`.maplibregl-marker` is
// `position: absolute`, which shrink-wraps the overlay to its content). zmapgl
// imports it as a side effect from its barrel, but the docs alias `zmapgl` to
// the library *source* and `packages/zmap`'s `sideEffects: ["**/*.css"]` marks
// that barrel side-effect-free — so Vite's production build tree-shakes the
// bare CSS import and markers render unstyled (full-width, mispositioned).
// Import it here explicitly, exactly as a real consumer would.
import "maplibre-gl/dist/maplibre-gl.css";
import { AppThemeProvider } from "./theme";
import App from "./App";
import "./testRegistry";

// Vite sets BASE_URL from the build `base`: "/" in dev and on Netlify, "/zmap/"
// for the GitHub Pages subpath build. react-router wants a leading-slash,
// no-trailing-slash basename, so normalize it (and fall back to "/" at root).
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);

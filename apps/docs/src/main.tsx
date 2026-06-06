import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppThemeProvider } from "./theme";
import { App } from "./App";

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

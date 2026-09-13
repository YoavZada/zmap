// Centralized, typed access to this app's environment. Values come from .env
// (VITE_-prefixed so Vite exposes them to client code); the fallbacks are the
// pinned dev ports so the app works with no .env present.

// The pathfinder demo runs as its own app. Override VITE_PATHFINDER_URL for a
// deployed build.
export const PATHFINDER_URL =
  import.meta.env.VITE_PATHFINDER_URL ?? "http://localhost:5174";

// ArcGIS Location Platform API key for the live ArcGIS toggle on /providers.
// Optional — when unset the toggle is hidden and the page shows a snippet
// instead. `|| undefined` collapses the empty string a blank .env line yields.
export const ARCGIS_KEY: string | undefined =
  import.meta.env.VITE_ARCGIS_KEY || undefined;

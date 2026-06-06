// Centralized, typed access to this app's environment. Values come from .env
// (VITE_-prefixed so Vite exposes them to client code); the fallbacks are the
// pinned dev ports so the app works with no .env present.

// The zmap docs/showcase site runs as its own app. Override VITE_DOCS_URL for a
// deployed build.
export const DOCS_URL =
  import.meta.env.VITE_DOCS_URL ?? "http://localhost:5173";

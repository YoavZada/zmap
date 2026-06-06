// Centralized, typed access to this app's environment. Values come from .env
// (VITE_-prefixed so Vite exposes them to client code); the fallbacks are the
// pinned dev ports so the app works with no .env present.

// The pathfinder demo runs as its own app. Override VITE_PATHFINDER_URL for a
// deployed build.
export const PATHFINDER_URL =
  import.meta.env.VITE_PATHFINDER_URL ?? "http://localhost:5174";

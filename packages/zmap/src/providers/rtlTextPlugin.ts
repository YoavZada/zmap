import maplibregl from "maplibre-gl";

/** The build MapLibre's docs recommend; override via `<Map rtlTextPlugin="https://…">`. */
export const DEFAULT_RTL_TEXT_PLUGIN_URL =
  "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js";

let registering: Promise<void> | null = null;

/** True once `setRTLTextPlugin` has been called on this page (by us or by the consumer). */
export function isRtlTextPluginRegistered(): boolean {
  return maplibregl.getRTLTextPluginStatus() !== "unavailable";
}

/** Calls MapLibre's `setRTLTextPlugin`, isolated so a synchronous throw from
 * it can never run before `registering` is assigned in the caller below (an
 * `async () => { await setRTLTextPlugin(...) }` IIFE would instead throw —
 * and run its own `finally` — synchronously, before the `registering =`
 * assignment that follows it, clobbering the reset back to non-null). */
async function loadPlugin(url: string): Promise<void> {
  await maplibregl.setRTLTextPlugin(url, true /* lazy */);
}

/**
 * Load MapLibre's RTL text plugin once per page so Hebrew/Arabic labels shape
 * and order correctly. Idempotent: a second call (any URL) is a no-op; a
 * failed load resets so it can be retried. SSR-safe: this module never
 * touches `window`/`document` itself (only `<Map>`'s client-side create
 * effect calls it), and `setRTLTextPlugin(url, true)` registers the URL
 * without fetching the plugin script — the fetch is deferred until MapLibre
 * first needs to shape RTL text.
 */
export async function registerRtlTextPlugin(
  url = DEFAULT_RTL_TEXT_PLUGIN_URL,
): Promise<void> {
  // MapLibre throws if setRTLTextPlugin runs while the plugin isn't
  // "unavailable" (already registered, loading, or loaded) — including by a
  // consumer calling it directly, outside this module.
  if (isRtlTextPluginRegistered()) return;
  if (registering) return registering;
  registering = loadPlugin(url);
  try {
    await registering;
  } finally {
    registering = null;
  }
}

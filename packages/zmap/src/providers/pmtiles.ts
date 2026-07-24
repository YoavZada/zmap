import maplibregl from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";

let registered = false;
let registering: Promise<void> | null = null;

/** True once the `pmtiles://` protocol has been registered on maplibre-gl. */
export function isPmtilesRegistered(): boolean {
  return registered;
}

/**
 * Register the `pmtiles://` protocol handler on maplibre-gl so styles and
 * sources can reference `.pmtiles` archives. Idempotent and safe to call
 * concurrently; the `pmtiles` package is dynamically imported, so it stays out
 * of the base bundle and never runs at module load (SSR-safe).
 */
export async function registerPmtilesProtocol(): Promise<void> {
  if (registered) return;
  if (registering) return registering;
  registering = (async () => {
    const { Protocol } = await import("pmtiles");
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    registered = true;
    registering = null;
  })();
  return registering;
}

/** True if a resolved style (URL or spec) references a `pmtiles://` source. */
export function usesPmtiles(style: string | StyleSpecification): boolean {
  if (typeof style === "string") return style.includes("pmtiles://");
  const sources = style?.sources ?? {};
  return Object.values(sources).some((s) => {
    const src = s as { url?: string; tiles?: string[] };
    if (src.url?.includes("pmtiles://")) return true;
    return (src.tiles ?? []).some((t) => t.includes("pmtiles://"));
  });
}

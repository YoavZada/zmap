// Always-on tooling hook: window.__zmapMaps() returns every mounted map
// instance on the page. The library marks each loaded map's container with
// [data-zmap-loaded] and hangs the instance off it (see zmapgl Map.tsx); this
// just collects them. Deliberately not dev-gated — the docs site is a demo,
// and one code path means the bundle CI tests is the bundle that deploys.
import type maplibregl from "maplibre-gl";

type MapContainer = HTMLElement & { __zmapMap?: maplibregl.Map };

declare global {
  interface Window {
    __zmapMaps: () => maplibregl.Map[];
  }
}

window.__zmapMaps = () =>
  Array.from(
    document.querySelectorAll<MapContainer>("[data-zmap-loaded]"),
  ).flatMap((el) => (el.__zmapMap ? [el.__zmapMap] : []));

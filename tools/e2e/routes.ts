// The docs site's content routes (mirrors apps/docs/src/App.tsx; the driver
// keeps its own copy in driver.mjs — update all three together).
//
// hasMap: the route mounts at least one <Map> once its first demo reveals.
// hasGlLayers: the first revealed map adds custom GL work (zmap-* layers or a
// custom geojson source), so the smoke test can assert beyond the basemap.
export type DocsRoute = {
  path: string;
  name: string;
  hasMap: boolean;
  hasGlLayers: boolean;
};

export const ROUTES: DocsRoute[] = [
  { path: "/", name: "intro", hasMap: true, hasGlLayers: false },
  { path: "/blocks", name: "blocks", hasMap: true, hasGlLayers: false },
  { path: "/providers", name: "providers", hasMap: true, hasGlLayers: false },
  { path: "/markers", name: "markers", hasMap: true, hasGlLayers: false },
  { path: "/popups", name: "popups", hasMap: true, hasGlLayers: false },
  { path: "/controls", name: "controls", hasMap: true, hasGlLayers: false },
  { path: "/geocoder", name: "geocoder", hasMap: true, hasGlLayers: false },
  {
    path: "/interaction",
    name: "interaction",
    hasMap: true,
    hasGlLayers: false,
  },
  { path: "/routes", name: "routes", hasMap: true, hasGlLayers: true },
  { path: "/arcs", name: "arcs", hasMap: true, hasGlLayers: true },
  { path: "/clusters", name: "clusters", hasMap: true, hasGlLayers: true },
  { path: "/layers", name: "layers", hasMap: true, hasGlLayers: true },
  { path: "/choropleth", name: "choropleth", hasMap: true, hasGlLayers: true },
  { path: "/hexbins", name: "hexbins", hasMap: true, hasGlLayers: true },
  { path: "/time", name: "time", hasMap: true, hasGlLayers: true },
  { path: "/extrusion", name: "extrusion", hasMap: true, hasGlLayers: true },
  { path: "/api", name: "api", hasMap: false, hasGlLayers: false },
  { path: "/changelog", name: "changelog", hasMap: false, hasGlLayers: false },
  {
    path: "/guides/nextjs",
    name: "guide-nextjs",
    hasMap: false,
    hasGlLayers: false,
  },
  {
    path: "/guides/react-map-gl",
    name: "guide-react-map-gl",
    hasMap: false,
    hasGlLayers: false,
  },
];

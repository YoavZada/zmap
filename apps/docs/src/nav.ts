import type { ElementType } from "react";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import PaletteOutlined from "@mui/icons-material/PaletteOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import TravelExploreOutlined from "@mui/icons-material/TravelExploreOutlined";
import DesignServicesOutlined from "@mui/icons-material/DesignServicesOutlined";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import TimelineOutlined from "@mui/icons-material/TimelineOutlined";
import BubbleChartOutlined from "@mui/icons-material/BubbleChartOutlined";
import LayersOutlined from "@mui/icons-material/LayersOutlined";
import GradientOutlined from "@mui/icons-material/GradientOutlined";
import HexagonOutlined from "@mui/icons-material/HexagonOutlined";
import PlayCircleOutline from "@mui/icons-material/PlayCircleOutline";
import ViewInArOutlined from "@mui/icons-material/ViewInArOutlined";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import RocketLaunchOutlined from "@mui/icons-material/RocketLaunchOutlined";
import SwapHorizOutlined from "@mui/icons-material/SwapHorizOutlined";
import PublicOutlined from "@mui/icons-material/PublicOutlined";
import GridOnOutlined from "@mui/icons-material/GridOnOutlined";
import TerminalOutlined from "@mui/icons-material/TerminalOutlined";

export interface NavItem {
  path: string;
  label: string;
  icon: ElementType;
  /** One-line summary used for the page's meta description. */
  description: string;
}

export const navItems: NavItem[] = [
  {
    path: "/",
    label: "Introduction",
    icon: InfoOutlined,
    description:
      "MUI-native map components built on MapLibre GL — install zmapgl and drop a themed map into your React app.",
  },
  {
    path: "/blocks",
    label: "Blocks",
    icon: GridViewOutlined,
    description:
      "Complete copy-paste scenarios — store locator, analytics dashboard, flight network, delivery tracker, 3D city — each one self-contained file.",
  },
  {
    path: "/providers",
    label: "Providers & Theming",
    icon: PaletteOutlined,
    description:
      "Switch basemap providers and let maps follow your MUI theme's light and dark mode automatically.",
  },
  {
    path: "/guides/nextjs",
    label: "Next.js & SSR",
    icon: RocketLaunchOutlined,
    description:
      "Use zmapgl in Next.js and SSR frameworks — one stylesheet import, server-component friendly.",
  },
  {
    path: "/guides/react-map-gl",
    label: "From react-map-gl",
    icon: SwapHorizOutlined,
    description:
      "Migration guide — map react-map-gl concepts to zmapgl components, see what you gain and what differs.",
  },
  {
    path: "/markers",
    label: "Markers",
    icon: PlaceOutlined,
    description:
      "Place MUI content on the map: pins, custom components, draggable markers, and GPU symbol labels.",
  },
  {
    path: "/popups",
    label: "Popups & Tooltips",
    icon: ChatBubbleOutline,
    description:
      "Theme-aware popups on click and lightweight tooltips on hover, anchored to map coordinates.",
  },
  {
    path: "/controls",
    label: "Controls",
    icon: TuneOutlined,
    description:
      "Zoom, compass, geolocate, fullscreen, pitch, and scale controls styled to match your MUI theme.",
  },
  {
    path: "/geocoder",
    label: "Geocoder",
    icon: TravelExploreOutlined,
    description:
      "Place search with MUI Autocomplete — pluggable geocoding providers, fly-to, and a result marker.",
  },
  {
    path: "/interaction",
    label: "Interaction",
    icon: DesignServicesOutlined,
    description:
      "Drawing tools, measuring, context menus, box and lasso selection, and declarative camera control.",
  },
  {
    path: "/routes",
    label: "Routes",
    icon: RouteOutlined,
    description:
      "Declarative polylines with palette-token colors, dashing, and width — rendered as GPU line layers.",
  },
  {
    path: "/arcs",
    label: "Arcs",
    icon: TimelineOutlined,
    description:
      "Curved bezier and geodesic arcs between points — flight paths and connection maps.",
  },
  {
    path: "/clusters",
    label: "Clusters",
    icon: BubbleChartOutlined,
    description:
      "Native MapLibre clustering rendered as MUI markers, with aggregate properties and custom renderers.",
  },
  {
    path: "/layers",
    label: "Layers",
    icon: LayersOutlined,
    description:
      "Toggleable overlays with LayerControl, GeoJSON layers, point layers, heatmaps, and legends.",
  },
  {
    path: "/choropleth",
    label: "Choropleth",
    icon: GradientOutlined,
    description:
      "Data-driven polygon coloring with interpolate and step ramps, hover feature-state, and legends.",
  },
  {
    path: "/hexbins",
    label: "Hexbins & grids",
    icon: HexagonOutlined,
    description:
      "Aggregate points into hexagonal or square bins, flat or extruded, with weighted color ramps.",
  },
  {
    path: "/time",
    label: "Time playback",
    icon: PlayCircleOutline,
    description:
      "Animate time-stamped points with a themed transport bar — trails, looping, and scrubbing.",
  },
  {
    path: "/terrain",
    label: "Globe & terrain",
    icon: PublicOutlined,
    description:
      "Globe projection and 3D terrain — drape the basemap over real elevation, with an atmospheric sky.",
  },
  {
    path: "/raster",
    label: "Raster & PMTiles",
    icon: GridOnOutlined,
    description:
      "Add XYZ/WMS raster tile layers and read .pmtiles archives via a lazy protocol registration.",
  },
  {
    path: "/extrusion",
    label: "3D Extrusion",
    icon: ViewInArOutlined,
    description:
      "Extrude polygons into 3D — buildings by height, data-driven prisms, and tilt controls.",
  },
  {
    path: "/api",
    label: "API Reference",
    icon: MenuBookOutlined,
    description:
      "Every component, hook, provider, utility, and type zmapgl ships, with links into the demos.",
  },
  {
    path: "/changelog",
    label: "Changelog",
    icon: HistoryOutlined,
    description:
      "Release history for zmapgl — every version and its changes, newest first.",
  },
  {
    path: "/playground",
    label: "Playground",
    icon: TerminalOutlined,
    description:
      "Edit a live zmapgl app in the browser and see the map update instantly.",
  },
];

/* ------------------------------------------------------------------ *
 * Derived navigation model
 *
 * `navItems` above stays the flat source of truth (Search + RouteMeta look
 * pages up by path). The structures below are views over the SAME objects:
 *   - `componentGroups` powers the contextual sidebar on component/guide routes.
 *   - `destinations` powers the navbar's top-level tabs.
 * ------------------------------------------------------------------ */

const byPath = (path: string): NavItem => {
  const item = navItems.find((n) => n.path === path);
  if (!item) throw new Error(`nav: no NavItem registered for "${path}"`);
  return item;
};

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** The component reference, grouped for the sidebar. "Guides" collects
 * standalone walkthroughs (Providers & Theming, framework/migration guides);
 * the remaining 15 pages cluster by what they do. */
export const componentGroups: NavGroup[] = [
  {
    label: "Guides",
    items: [
      byPath("/providers"),
      byPath("/guides/nextjs"),
      byPath("/guides/react-map-gl"),
    ],
  },
  {
    label: "Overlays",
    items: [byPath("/markers"), byPath("/popups"), byPath("/clusters")],
  },
  {
    label: "Data layers",
    items: [
      byPath("/routes"),
      byPath("/arcs"),
      byPath("/layers"),
      byPath("/choropleth"),
      byPath("/hexbins"),
      byPath("/extrusion"),
    ],
  },
  {
    label: "Controls & interaction",
    items: [
      byPath("/controls"),
      byPath("/geocoder"),
      byPath("/interaction"),
      byPath("/time"),
    ],
  },
  {
    label: "Basemap & 3D",
    items: [byPath("/terrain"), byPath("/raster")],
  },
];

// Every route that lives in the component sidebar (guides included).
const componentPaths = new Set(
  componentGroups.flatMap((g) => g.items.map((i) => i.path)),
);

/** True for any route that renders the grouped component rail. */
export const isComponentRoute = (path: string): boolean =>
  componentPaths.has(path);

export interface Destination {
  label: string;
  to: string;
  /** Whether this tab should read as active for the given pathname. */
  isActive: (path: string) => boolean;
}

/** Top-level navbar tabs. "Components" lands on the first component page and
 * stays active across the whole component/guide section. */
export const destinations: Destination[] = [
  { label: "Components", to: "/markers", isActive: isComponentRoute },
  { label: "Blocks", to: "/blocks", isActive: (p) => p === "/blocks" },
  { label: "API", to: "/api", isActive: (p) => p === "/api" },
  {
    label: "Playground",
    to: "/playground",
    isActive: (p) => p === "/playground",
  },
];

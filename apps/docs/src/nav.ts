import type { ElementType } from "react";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import PaletteOutlined from "@mui/icons-material/PaletteOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
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
    path: "/providers",
    label: "Providers & Theming",
    icon: PaletteOutlined,
    description:
      "Switch basemap providers and let maps follow your MUI theme's light and dark mode automatically.",
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
];

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

export interface NavItem {
  path: string;
  label: string;
  icon: ElementType;
}

export const navItems: NavItem[] = [
  { path: "/", label: "Introduction", icon: InfoOutlined },
  { path: "/providers", label: "Providers & Theming", icon: PaletteOutlined },
  { path: "/markers", label: "Markers", icon: PlaceOutlined },
  { path: "/popups", label: "Popups & Tooltips", icon: ChatBubbleOutline },
  { path: "/controls", label: "Controls", icon: TuneOutlined },
  { path: "/interaction", label: "Interaction", icon: DesignServicesOutlined },
  { path: "/routes", label: "Routes", icon: RouteOutlined },
  { path: "/arcs", label: "Arcs", icon: TimelineOutlined },
  { path: "/clusters", label: "Clusters", icon: BubbleChartOutlined },
  { path: "/layers", label: "Layers", icon: LayersOutlined },
  { path: "/choropleth", label: "Choropleth", icon: GradientOutlined },
  { path: "/hexbins", label: "Hexbins & grids", icon: HexagonOutlined },
  { path: "/time", label: "Time playback", icon: PlayCircleOutline },
  { path: "/extrusion", label: "3D Extrusion", icon: ViewInArOutlined },
];

import { useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import type { MapLayerMouseEvent } from "maplibre-gl";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { useLayerClick } from "../../hooks/useLayerClick";
import { resolvePaletteColor } from "../../utils/color";
import {
  applyLayerOverrides,
  type LayerOverride,
} from "../../utils/layerOverrides";
import {
  featureCollection,
  lineFeature,
  type LngLatTuple,
} from "../../utils/geojson";

/** Props for `<Route>`, which draws a polyline on the map from a list of coordinates. */
export interface RouteProps {
  /** Explicit source/layer id. Auto-generated when omitted. */
  id?: string;
  /** The line's vertices as [longitude, latitude] pairs, in draw order. */
  coordinates: LngLatTuple[];
  /** MUI palette token ("primary.main") or any CSS color. Default "primary.main". */
  color?: string;
  /** Line width in pixels. Default 4. */
  width?: number;
  /** Line opacity, 0–1. Default 1. */
  opacity?: number;
  /** Draw the line dashed instead of solid. Default false. */
  dashed?: boolean;
  /** How line ends are capped. Default "round". */
  lineCap?: "butt" | "round" | "square";
  /** How line corners are joined. Default "round". */
  lineJoin?: "bevel" | "round" | "miter";
  /** Insert before this existing layer id. */
  beforeId?: string;
  /** Paint/layout patches merged into the generated line layer. */
  layerOverrides?: { line?: LayerOverride };
  /** Fired when the line is clicked, with the raw map event. */
  onClick?: (event: MapLayerMouseEvent) => void;
}

/** Draws a polyline (LineString) on the map from a list of coordinates. */
const Route: FC<RouteProps> = ({
  id,
  coordinates,
  color = "primary.main",
  width = 4,
  opacity = 1,
  dashed = false,
  lineCap = "round",
  lineJoin = "round",
  beforeId,
  layerOverrides,
  onClick,
}) => {
  const theme = useTheme();
  const reactId = useId();
  const baseId = id ?? `zmap-route-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const layerId = `${baseId}-line`;
  const resolvedColor = resolvePaletteColor(theme, color);

  const data = useMemo(
    () => featureCollection([lineFeature(coordinates)]),
    [coordinates],
  );

  const layers = useMemo<LayerInput[]>(
    () =>
      applyLayerOverrides(
        [
          {
            id: layerId,
            type: "line",
            layout: { "line-cap": lineCap, "line-join": lineJoin },
            paint: {
              "line-color": resolvedColor,
              "line-width": width,
              "line-opacity": opacity,
              ...(dashed ? { "line-dasharray": [2, 1.5] } : {}),
            },
          },
        ],
        layerOverrides,
      ),
    [
      layerId,
      resolvedColor,
      width,
      opacity,
      dashed,
      lineCap,
      lineJoin,
      layerOverrides,
    ],
  );

  useMapLayer({ id: baseId, data, layers, beforeId });

  useLayerClick(layerId, onClick);

  return null;
};

export default Route;

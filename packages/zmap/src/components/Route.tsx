import { useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import { useMapLayer, type LayerInput } from "../hooks/useMapLayer";
import { resolvePaletteColor } from "../utils/color";
import { featureCollection, lineFeature, type LngLatTuple } from "../utils/geojson";

export interface RouteProps {
  /** Explicit source/layer id. Auto-generated when omitted. */
  id?: string;
  coordinates: LngLatTuple[];
  /** MUI palette token ("primary.main") or any CSS color. Default "primary.main". */
  color?: string;
  width?: number;
  opacity?: number;
  dashed?: boolean;
  lineCap?: "butt" | "round" | "square";
  lineJoin?: "bevel" | "round" | "miter";
  /** Insert before this existing layer id. */
  beforeId?: string;
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
}) => {
  const theme = useTheme();
  const reactId = useId();
  const baseId = id ?? `zmap-route-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const resolvedColor = resolvePaletteColor(theme, color);

  const data = useMemo(
    () => featureCollection([lineFeature(coordinates)]),
    [coordinates],
  );

  const layers = useMemo<LayerInput[]>(
    () => [
      {
        id: `${baseId}-line`,
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
    [baseId, resolvedColor, width, opacity, dashed, lineCap, lineJoin],
  );

  useMapLayer({ id: baseId, data, layers, beforeId });
  return null;
};

export default Route;

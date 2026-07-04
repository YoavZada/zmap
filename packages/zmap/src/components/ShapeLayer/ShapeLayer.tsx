import { useEffect, useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import type { GeoJSON } from "geojson";
import { useMapContext } from "../../context/useMap";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { resolvePaletteColor } from "../../utils/color";
import {
  buildColorExpression,
  isChoroplethSpec,
  type ChoroplethSpec,
} from "../../utils/choropleth";

export type ShapeLayerProps = {
  /** Unique source/layer id. Auto-generated when omitted. */
  id?: string;
  /** GeoJSON polygons and/or lines. */
  data: GeoJSON;
  /** A palette token / CSS color, or a choropleth spec for data-driven fill. */
  fillColor?: string | ChoroplethSpec;
  /** Fill opacity, 0–1. Default 0.4. */
  fillOpacity?: number;
  /** Outline color (palette token or CSS). Default "primary.main". */
  lineColor?: string;
  /** Outline width in pixels. Default 1.5. */
  lineWidth?: number;
  /** Outline opacity, 0–1. Default 1. */
  lineOpacity?: number;
  /** Fired with the clicked GeoJSON feature. */
  onClick?: (feature: any) => void;
};

/** Renders GeoJSON polygons/lines as fill + outline layers, with optional choropleth fill. */
const ShapeLayer: FC<ShapeLayerProps> = ({
  id,
  data,
  fillColor = "primary.main",
  fillOpacity = 0.4,
  lineColor = "primary.main",
  lineWidth = 1.5,
  lineOpacity = 1,
  onClick,
}) => {
  const theme = useTheme();
  const { map } = useMapContext();
  const reactId = useId();
  const baseId = id ?? `zmap-shape-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const fillId = `${baseId}-fill`;

  const fill = useMemo(
    () =>
      isChoroplethSpec(fillColor)
        ? buildColorExpression(fillColor, theme)
        : resolvePaletteColor(theme, fillColor),
    [fillColor, theme],
  );

  const layers = useMemo<LayerInput[]>(
    () => [
      {
        id: fillId,
        type: "fill",
        paint: { "fill-color": fill, "fill-opacity": fillOpacity },
      },
      {
        id: `${baseId}-line`,
        type: "line",
        paint: {
          "line-color": resolvePaletteColor(theme, lineColor),
          "line-width": lineWidth,
          "line-opacity": lineOpacity,
        },
      },
    ],
    [
      baseId,
      fillId,
      fill,
      fillOpacity,
      lineColor,
      lineWidth,
      lineOpacity,
      theme,
    ],
  );

  useMapLayer({ id: baseId, data, layers });

  useEffect(() => {
    if (!map || !onClick) return;
    const handler = (e: any) => {
      const f = e.features?.[0];
      if (f) onClick(f);
    };
    const enter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const leave = () => {
      map.getCanvas().style.cursor = "";
    };
    map.on("click", fillId, handler);
    map.on("mouseenter", fillId, enter);
    map.on("mouseleave", fillId, leave);
    return () => {
      map.off("click", fillId, handler);
      map.off("mouseenter", fillId, enter);
      map.off("mouseleave", fillId, leave);
    };
  }, [map, fillId, onClick]);

  return null;
};

export default ShapeLayer;

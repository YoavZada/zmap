import { useEffect, useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import type { ExpressionSpecification } from "maplibre-gl";
import type { GeoJSON } from "geojson";
import { useMapContext } from "../../context/useMap";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { resolvePaletteColor } from "../../utils/color";
import {
  buildColorExpression,
  isChoroplethSpec,
  type ChoroplethSpec,
} from "../../utils/choropleth";

export type ExtrusionLayerProps = {
  /** Unique source/layer id. Auto-generated when omitted. */
  id?: string;
  /** GeoJSON polygons to extrude. */
  data: GeoJSON;
  /** Fill — a palette token / CSS color, or a choropleth spec for data-driven color. */
  color?: string | ChoroplethSpec;
  /** Constant height in meters. Ignored when `heightProperty` is set. Default 0. */
  height?: number;
  /** Feature property to drive height from (e.g. building floors × meters). */
  heightProperty?: string;
  /** Multiplier applied to `heightProperty` values. Default 1. */
  heightScale?: number;
  /** Base height in meters — the floor the extrusion rises from. Default 0. */
  base?: number;
  /** Extrusion opacity, 0–1. Default 0.9. */
  opacity?: number;
  /** Fired with the clicked GeoJSON feature. */
  onClick?: (feature: any) => void;
};

/**
 * Extrudes GeoJSON polygons into 3D prisms (MapLibre `fill-extrusion`) — for
 * buildings or any value mapped to height. Height can be constant or driven by
 * a feature property; color can be a palette token or a data-driven choropleth.
 * Pitch the camera (e.g. MapControls' tilt button) to see the relief.
 */
const ExtrusionLayer: FC<ExtrusionLayerProps> = ({
  id,
  data,
  color = "primary.main",
  height = 0,
  heightProperty,
  heightScale = 1,
  base = 0,
  opacity = 0.9,
  onClick,
}) => {
  const theme = useTheme();
  const { map } = useMapContext();
  const reactId = useId();
  const baseId =
    id ?? `zmap-extrusion-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const layerId = `${baseId}-extrusion`;

  const fillColor = useMemo(
    () =>
      isChoroplethSpec(color)
        ? buildColorExpression(color, theme)
        : resolvePaletteColor(theme, color),
    [color, theme],
  );

  const heightExpr = useMemo<number | ExpressionSpecification>(
    () =>
      heightProperty
        ? ([
            "*",
            ["coalesce", ["to-number", ["get", heightProperty]], 0],
            heightScale,
          ] as ExpressionSpecification)
        : height,
    [heightProperty, heightScale, height],
  );

  const layers = useMemo<LayerInput[]>(
    () => [
      {
        id: layerId,
        type: "fill-extrusion",
        paint: {
          "fill-extrusion-color": fillColor,
          "fill-extrusion-height": heightExpr,
          "fill-extrusion-base": base,
          "fill-extrusion-opacity": opacity,
        },
      },
    ],
    [layerId, fillColor, heightExpr, base, opacity],
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
    map.on("click", layerId, handler);
    map.on("mouseenter", layerId, enter);
    map.on("mouseleave", layerId, leave);
    return () => {
      map.off("click", layerId, handler);
      map.off("mouseenter", layerId, enter);
      map.off("mouseleave", layerId, leave);
    };
  }, [map, layerId, onClick]);

  return null;
};

export default ExtrusionLayer;

import { useEffect, useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import type { ExpressionSpecification } from "maplibre-gl";
import { useMapContext } from "../context/useMap";
import { useMapLayer, type LayerInput } from "../hooks/useMapLayer";
import { resolvePaletteColor } from "../utils/color";
import { buildColorExpression } from "../utils/choropleth";
import { binPoints } from "../utils/bin";
import type { LayerPoint } from "./PointLayer";

export type HexbinLayerProps = {
  id?: string;
  points: LayerPoint[];
  /** Cell shape — "hex" (default) or "square" grid. */
  cell?: "hex" | "square";
  /** Approximate cell size in kilometers. Default 50. */
  radius?: number;
  /** Sum this point property instead of counting points. */
  weightProperty?: string;
  /**
   * `[value, color]` stops for the bin color ramp; colors may be palette tokens.
   * Omit to auto-build a ramp spanning the data's `[0, max]`.
   */
  colorRamp?: [number, string][];
  opacity?: number;
  /** Render bins as 3D columns (height ∝ value). Pitch the camera to see them. */
  extruded?: boolean;
  /** Meters of column height per unit value when extruded. Default scales max → ~1500m. */
  heightScale?: number;
  /** Cell outline color (flat mode). Default "background.paper". */
  lineColor?: string;
  lineWidth?: number;
  onClick?: (bin: { value: number; count: number }) => void;
};

const DEFAULT_RAMP: [number, string][] = [
  [0, "info.light"],
  [0.5, "warning.main"],
  [1, "error.main"],
];

/**
 * Aggregates points into hexagonal or square cells colored by count (or a summed
 * weight) — a clearer read of density than a heatmap at a glance, and steadier
 * than clustering as you pan. Optionally extrudes each cell into a 3D column.
 */
const HexbinLayer: FC<HexbinLayerProps> = ({
  id,
  points,
  cell = "hex",
  radius = 50,
  weightProperty,
  colorRamp,
  opacity = 0.75,
  extruded = false,
  heightScale,
  lineColor = "background.paper",
  lineWidth = 0.5,
  onClick,
}) => {
  const theme = useTheme();
  const { map } = useMapContext();
  const reactId = useId();
  const baseId = id ?? `zmap-hexbin-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const fillId = `${baseId}-fill`;

  const data = useMemo(
    () => binPoints(points, { cell, radius, weightProperty }),
    [points, cell, radius, weightProperty],
  );

  const max = useMemo(
    () => data.features.reduce((m, f) => Math.max(m, f.properties.value), 0),
    [data],
  );

  // Build a fill-color expression keyed on each bin's `value`. A custom
  // `colorRamp` is taken verbatim; otherwise scale the default ramp to [0, max].
  const colorExpr = useMemo(() => {
    const top = max || 1;
    const stops =
      colorRamp ??
      DEFAULT_RAMP.map(([t, c]) => [t * top, c] as [number, string]);
    return buildColorExpression(
      { property: "value", stops, type: "interpolate" },
      theme,
    );
  }, [colorRamp, max, theme]);

  const hScale = heightScale ?? 1500 / (max || 1);

  const layers = useMemo<LayerInput[]>(() => {
    if (extruded) {
      return [
        {
          id: fillId,
          type: "fill-extrusion",
          paint: {
            "fill-extrusion-color": colorExpr,
            "fill-extrusion-height": [
              "*",
              ["get", "value"],
              hScale,
            ] as ExpressionSpecification,
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": opacity,
          },
        },
      ];
    }
    return [
      {
        id: fillId,
        type: "fill",
        paint: { "fill-color": colorExpr, "fill-opacity": opacity },
      },
      {
        id: `${baseId}-line`,
        type: "line",
        paint: {
          "line-color": resolvePaletteColor(theme, lineColor),
          "line-width": lineWidth,
          "line-opacity": 0.4,
        },
      },
    ];
  }, [
    extruded,
    fillId,
    baseId,
    colorExpr,
    hScale,
    opacity,
    lineColor,
    lineWidth,
    theme,
  ]);

  useMapLayer({ id: baseId, data, layers });

  useEffect(() => {
    if (!map || !onClick) return;
    const handler = (e: any) => {
      const f = e.features?.[0];
      if (f) {
        onClick({
          value: f.properties?.value as number,
          count: f.properties?.count as number,
        });
      }
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

export default HexbinLayer;

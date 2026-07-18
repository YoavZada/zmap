import { useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import type {
  ExpressionSpecification,
  MapLayerMouseEvent,
} from "maplibre-gl";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { useLayerClick } from "../../hooks/useLayerClick";
import { resolvePaletteColor } from "../../utils/color";
import { buildColorExpression } from "../../utils/choropleth";
import { warnDeprecatedProp } from "../../utils/deprecation";
import {
  applyLayerOverrides,
  type LayerOverride,
} from "../../utils/layerOverrides";
import { binPoints } from "../../utils/bin";
import type { LayerPoint } from "../PointLayer";

export type HexbinLayerProps = {
  /** Unique source/layer id. Auto-generated when omitted. */
  id?: string;
  /** The points to aggregate into cells. */
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
  /** Cell fill opacity, 0–1. Default 0.75. */
  fillOpacity?: number;
  /**
   * Deprecated: use `fillOpacity` instead.
   * @deprecated Use `fillOpacity`. Removed in v1.0.
   */
  opacity?: number;
  /** Render bins as 3D columns (height ∝ value). Pitch the camera to see them. */
  extruded?: boolean;
  /** Meters of column height per unit value when extruded. Default scales max → ~1500m. */
  heightScale?: number;
  /** Cell outline color (flat mode). Default "background.paper". */
  strokeColor?: string;
  /** Cell outline width in pixels (flat mode). Default 0.5. */
  strokeWidth?: number;
  /** Cell outline opacity, 0–1 (flat mode). Default 0.4. */
  strokeOpacity?: number;
  /**
   * Deprecated: use `strokeColor` instead.
   * @deprecated Use `strokeColor`. Removed in v1.0.
   */
  lineColor?: string;
  /**
   * Deprecated: use `strokeWidth` instead.
   * @deprecated Use `strokeWidth`. Removed in v1.0.
   */
  lineWidth?: number;
  /** Insert the layers before this existing layer id (e.g. a label layer). */
  beforeId?: string;
  /**
   * Paint/layout patches merged into the generated layers. The `fill` role
   * covers both the flat fill and the extruded fill-extrusion variant.
   */
  layerOverrides?: { fill?: LayerOverride; line?: LayerOverride };
  /** Fired with the clicked cell's aggregates and the raw map event. */
  onClick?: (
    bin: { value: number; count: number },
    event: MapLayerMouseEvent,
  ) => void;
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
  fillOpacity,
  opacity,
  extruded = false,
  heightScale,
  strokeColor,
  strokeWidth,
  strokeOpacity = 0.4,
  lineColor,
  lineWidth,
  beforeId,
  layerOverrides,
  onClick,
}) => {
  const theme = useTheme();
  const reactId = useId();
  const baseId = id ?? `zmap-hexbin-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const fillId = `${baseId}-fill`;

  if (opacity !== undefined) {
    warnDeprecatedProp("HexbinLayer", "opacity", "fillOpacity");
  }
  if (lineColor !== undefined) {
    warnDeprecatedProp("HexbinLayer", "lineColor", "strokeColor");
  }
  if (lineWidth !== undefined) {
    warnDeprecatedProp("HexbinLayer", "lineWidth", "strokeWidth");
  }
  const resolvedFillOpacity = fillOpacity ?? opacity ?? 0.75;
  const resolvedStroke = strokeColor ?? lineColor ?? "background.paper";
  const resolvedStrokeWidth = strokeWidth ?? lineWidth ?? 0.5;

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
    const base: LayerInput[] = extruded
      ? [
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
              "fill-extrusion-opacity": resolvedFillOpacity,
            },
          },
        ]
      : [
          {
            id: fillId,
            type: "fill",
            paint: { "fill-color": colorExpr, "fill-opacity": resolvedFillOpacity },
          },
          {
            id: `${baseId}-line`,
            type: "line",
            paint: {
              "line-color": resolvePaletteColor(theme, resolvedStroke),
              "line-width": resolvedStrokeWidth,
              "line-opacity": strokeOpacity,
            },
          },
        ];
    // The extruded variant's only layer still ends in "-fill", so the `fill`
    // override role covers both shapes.
    return applyLayerOverrides(base, layerOverrides);
  }, [
    extruded,
    fillId,
    baseId,
    colorExpr,
    hScale,
    resolvedFillOpacity,
    resolvedStroke,
    resolvedStrokeWidth,
    strokeOpacity,
    layerOverrides,
    theme,
  ]);

  useMapLayer({ id: baseId, data, layers, beforeId });

  useLayerClick(
    fillId,
    onClick
      ? (e) => {
          const f = e.features?.[0];
          if (f) {
            onClick(
              {
                value: f.properties?.value as number,
                count: f.properties?.count as number,
              },
              e,
            );
          }
        }
      : undefined,
  );

  return null;
};

export default HexbinLayer;

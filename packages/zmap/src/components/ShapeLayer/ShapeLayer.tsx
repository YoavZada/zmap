import { useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import type { GeoJSON } from "geojson";
import type { MapGeoJSONFeature, MapLayerMouseEvent } from "maplibre-gl";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { useLayerClick } from "../../hooks/useLayerClick";
import { resolvePaletteColor } from "../../utils/color";
import { warnDeprecatedProp } from "../../utils/deprecation";
import {
  applyLayerOverrides,
  type LayerOverride,
} from "../../utils/layerOverrides";
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
  strokeColor?: string;
  /** Outline width in pixels. Default 1.5. */
  strokeWidth?: number;
  /** Outline opacity, 0–1. Default 1. */
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
  /**
   * Deprecated: use `strokeOpacity` instead.
   * @deprecated Use `strokeOpacity`. Removed in v1.0.
   */
  lineOpacity?: number;
  /** Insert the layers before this existing layer id (e.g. a label layer). */
  beforeId?: string;
  /** Paint/layout patches merged into the generated fill/line layers. */
  layerOverrides?: { fill?: LayerOverride; line?: LayerOverride };
  /** Fired with the clicked feature and the raw map event. */
  onClick?: (feature: MapGeoJSONFeature, event: MapLayerMouseEvent) => void;
};

/** Renders GeoJSON polygons/lines as fill + outline layers, with optional choropleth fill. */
const ShapeLayer: FC<ShapeLayerProps> = ({
  id,
  data,
  fillColor = "primary.main",
  fillOpacity = 0.4,
  strokeColor,
  strokeWidth,
  strokeOpacity,
  lineColor,
  lineWidth,
  lineOpacity,
  beforeId,
  layerOverrides,
  onClick,
}) => {
  const theme = useTheme();
  const reactId = useId();
  const baseId = id ?? `zmap-shape-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const fillId = `${baseId}-fill`;

  if (lineColor !== undefined) {
    warnDeprecatedProp("ShapeLayer", "lineColor", "strokeColor");
  }
  if (lineWidth !== undefined) {
    warnDeprecatedProp("ShapeLayer", "lineWidth", "strokeWidth");
  }
  if (lineOpacity !== undefined) {
    warnDeprecatedProp("ShapeLayer", "lineOpacity", "strokeOpacity");
  }
  const resolvedStroke = strokeColor ?? lineColor ?? "primary.main";
  const resolvedStrokeWidth = strokeWidth ?? lineWidth ?? 1.5;
  const resolvedStrokeOpacity = strokeOpacity ?? lineOpacity ?? 1;

  const fill = useMemo(
    () =>
      isChoroplethSpec(fillColor)
        ? buildColorExpression(fillColor, theme)
        : resolvePaletteColor(theme, fillColor),
    [fillColor, theme],
  );

  const layers = useMemo<LayerInput[]>(
    () =>
      applyLayerOverrides(
        [
          {
            id: fillId,
            type: "fill",
            paint: { "fill-color": fill, "fill-opacity": fillOpacity },
          },
          {
            id: `${baseId}-line`,
            type: "line",
            paint: {
              "line-color": resolvePaletteColor(theme, resolvedStroke),
              "line-width": resolvedStrokeWidth,
              "line-opacity": resolvedStrokeOpacity,
            },
          },
        ],
        layerOverrides,
      ),
    [
      baseId,
      fillId,
      fill,
      fillOpacity,
      resolvedStroke,
      resolvedStrokeWidth,
      resolvedStrokeOpacity,
      layerOverrides,
      theme,
    ],
  );

  useMapLayer({ id: baseId, data, layers, beforeId });

  useLayerClick(
    fillId,
    onClick
      ? (e) => {
          const f = e.features?.[0];
          if (f) onClick(f, e);
        }
      : undefined,
  );

  return null;
};

export default ShapeLayer;

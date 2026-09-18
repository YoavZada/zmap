import { useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import type { GeoJSON } from "geojson";
import type { MapGeoJSONFeature, MapLayerMouseEvent } from "maplibre-gl";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { useLayerClick } from "../../hooks/useLayerClick";
import { useLayerHover } from "../../hooks/useLayerHover";
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
import {
  hoverCase,
  resolveHoverHighlight,
  type HoverHighlight,
} from "../../utils/hoverPaint";

/** Props for `<ShapeLayer>`, which renders GeoJSON polygons/lines as fill + outline layers. */
export type ShapeLayerProps = {
  /**
   * Unique source/layer id. Auto-generated when omitted. Sub-layers are
   * `${id}-<role>`; see `layerIds()`. Auto-generated ids are not
   * predictable — pass `id` when you need to reference the layers.
   */
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
  /**
   * Feature property to use as the stable feature id (MapLibre `promoteId`).
   * When omitted, ids are generated per feature (`generateId`), which is
   * enough for hover / feature-state highlighting.
   */
  featureId?: string;
  /** Paint/layout patches merged into the generated fill/line layers. */
  layerOverrides?: { fill?: LayerOverride; line?: LayerOverride };
  /** Fired with the clicked feature and the raw map event. */
  onClick?: (feature: MapGeoJSONFeature, event: MapLayerMouseEvent) => void;
  /** Fired with the hovered feature (null when the pointer leaves) and the raw map event. */
  onHover?: (
    feature: MapGeoJSONFeature | null,
    event: MapLayerMouseEvent,
  ) => void;
  /** Highlight the hovered feature: `true` for theme defaults (stronger fill, `text.primary` outline), or explicit colors/opacity. Uses feature-state, so it works with the default generated ids. */
  hoverHighlight?: boolean | HoverHighlight;
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
  featureId,
  layerOverrides,
  onClick,
  onHover,
  hoverHighlight,
}) => {
  const theme = useTheme();
  const reactId = useId();
  const baseId = id ?? `zmap-shape-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const fillId = `${baseId}-fill`;
  const lineId = `${baseId}-line`;

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
  const resolvedStrokeColor = resolvePaletteColor(theme, resolvedStroke);

  const highlight = useMemo(
    () =>
      resolveHoverHighlight(theme, hoverHighlight, {
        // `fill` is a choropleth expression, not a flat color, when
        // `fillColor` is a spec — omit the default so the color stays
        // unwrapped unless the caller gives an explicit override.
        fillColor: typeof fill === "string" ? fill : undefined,
        strokeColor: resolvedStrokeColor,
        fillOpacity,
      }),
    [hoverHighlight, theme, fill, resolvedStrokeColor, fillOpacity],
  );

  const layers = useMemo<LayerInput[]>(
    () =>
      applyLayerOverrides(
        [
          {
            id: fillId,
            type: "fill",
            paint: {
              "fill-color":
                highlight?.fillColor !== undefined
                  ? hoverCase(highlight.fillColor, fill)
                  : fill,
              "fill-opacity": highlight
                ? hoverCase(highlight.fillOpacity, fillOpacity)
                : fillOpacity,
            },
          },
          {
            id: lineId,
            type: "line",
            paint: {
              "line-color": highlight
                ? hoverCase(highlight.strokeColor, resolvedStrokeColor)
                : resolvedStrokeColor,
              "line-width": resolvedStrokeWidth,
              "line-opacity": resolvedStrokeOpacity,
            },
          },
        ],
        layerOverrides,
      ),
    [
      fillId,
      lineId,
      fill,
      fillOpacity,
      resolvedStrokeColor,
      resolvedStrokeWidth,
      resolvedStrokeOpacity,
      highlight,
      layerOverrides,
    ],
  );

  const sourceOptions = useMemo(
    () => (featureId ? { promoteId: featureId } : { generateId: true }),
    [featureId],
  );

  useMapLayer({ id: baseId, data, layers, beforeId, sourceOptions });

  useLayerClick(
    fillId,
    onClick
      ? (e) => {
          const f = e.features?.[0];
          if (f) onClick(f, e);
        }
      : undefined,
  );

  useLayerHover({
    layerIds: [fillId, lineId],
    sourceId: baseId,
    featureState: Boolean(hoverHighlight),
    onHover,
  });

  return null;
};

export default ShapeLayer;

import { useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import type {
  ExpressionSpecification,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
} from "maplibre-gl";
import type { GeoJSON } from "geojson";
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

/** Props for `<ExtrusionLayer>`, which extrudes GeoJSON polygons into 3D prisms. */
export type ExtrusionLayerProps = {
  /** Unique source/layer id. Auto-generated when omitted. */
  id?: string;
  /** GeoJSON polygons to extrude. */
  data: GeoJSON;
  /** Fill — a palette token / CSS color, or a choropleth spec for data-driven color. Default "primary.main". */
  fillColor?: string | ChoroplethSpec;
  /**
   * Deprecated: use `fillColor` instead.
   * @deprecated Use `fillColor`. Removed in v1.0.
   */
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
  fillOpacity?: number;
  /**
   * Deprecated: use `fillOpacity` instead.
   * @deprecated Use `fillOpacity`. Removed in v1.0.
   */
  opacity?: number;
  /** Insert the layer before this existing layer id (e.g. a label layer). */
  beforeId?: string;
  /** Paint/layout patches merged into the generated fill-extrusion layer. */
  layerOverrides?: { extrusion?: LayerOverride };
  /** Fired with the clicked feature and the raw map event. */
  onClick?: (feature: MapGeoJSONFeature, event: MapLayerMouseEvent) => void;
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
  fillColor,
  color,
  height = 0,
  heightProperty,
  heightScale = 1,
  base = 0,
  fillOpacity,
  opacity,
  beforeId,
  layerOverrides,
  onClick,
}) => {
  const theme = useTheme();
  const reactId = useId();
  const baseId =
    id ?? `zmap-extrusion-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const layerId = `${baseId}-extrusion`;

  if (color !== undefined) {
    warnDeprecatedProp("ExtrusionLayer", "color", "fillColor");
  }
  if (opacity !== undefined) {
    warnDeprecatedProp("ExtrusionLayer", "opacity", "fillOpacity");
  }
  const resolvedColor = fillColor ?? color ?? "primary.main";
  const resolvedOpacity = fillOpacity ?? opacity ?? 0.9;

  const fill = useMemo(
    () =>
      isChoroplethSpec(resolvedColor)
        ? buildColorExpression(resolvedColor, theme)
        : resolvePaletteColor(theme, resolvedColor),
    [resolvedColor, theme],
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
    () =>
      applyLayerOverrides(
        [
          {
            id: layerId,
            type: "fill-extrusion",
            paint: {
              "fill-extrusion-color": fill,
              "fill-extrusion-height": heightExpr,
              "fill-extrusion-base": base,
              "fill-extrusion-opacity": resolvedOpacity,
            },
          },
        ],
        layerOverrides,
      ),
    [layerId, fill, heightExpr, base, resolvedOpacity, layerOverrides],
  );

  useMapLayer({ id: baseId, data, layers, beforeId });

  useLayerClick(
    layerId,
    onClick
      ? (e) => {
          const f = e.features?.[0];
          if (f) onClick(f, e);
        }
      : undefined,
  );

  return null;
};

export default ExtrusionLayer;

import { useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import type { MapLayerMouseEvent } from "maplibre-gl";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { useLayerClick } from "../../hooks/useLayerClick";
import { resolvePaletteColor } from "../../utils/color";
import { warnDeprecatedProp } from "../../utils/deprecation";
import { featureCollection, pointFeature } from "../../utils/geojson";
import type { BasePoint } from "../../utils/geojson";
import {
  applyLayerOverrides,
  type LayerOverride,
} from "../../utils/layerOverrides";

/** A point rendered by PointLayer. */
export type LayerPoint = BasePoint;

/** Props for `<PointLayer>`, which renders many points as a single GPU circle layer. */
export type PointLayerProps = {
  /** Unique source/layer id. Auto-generated when omitted. */
  id?: string;
  /** The points to draw as circles. */
  points: LayerPoint[];
  /** Circle fill color (palette token or CSS). Default "primary.main". */
  fillColor?: string;
  /**
   * Deprecated: use `fillColor` instead.
   * @deprecated Use `fillColor`. Removed in v1.0.
   */
  color?: string;
  /** Circle radius in pixels. Default 6. */
  radius?: number;
  /** Circle fill opacity, 0–1. Default 1. */
  fillOpacity?: number;
  /**
   * Deprecated: use `fillOpacity` instead.
   * @deprecated Use `fillOpacity`. Removed in v1.0.
   */
  opacity?: number;
  /** Circle outline color (palette token or CSS). Default "background.paper". */
  strokeColor?: string;
  /** Circle outline width in pixels. Default 1.5. */
  strokeWidth?: number;
  /** Circle outline opacity, 0–1. Default 1. */
  strokeOpacity?: number;
  /** Insert the layer before this existing layer id (e.g. a label layer). */
  beforeId?: string;
  /** Paint/layout patches merged into the generated circle layer. */
  layerOverrides?: { circle?: LayerOverride };
  /** Fired with the clicked point, its index in `points`, and the raw event. */
  onClick?: (
    point: LayerPoint,
    index: number,
    event: MapLayerMouseEvent,
  ) => void;
};

/**
 * Renders many points as a single GPU circle layer — cheaper than one DOM
 * Marker per point. For rich/interactive content, use Marker instead.
 */
const PointLayer: FC<PointLayerProps> = ({
  id,
  points,
  fillColor,
  color,
  radius = 6,
  fillOpacity,
  opacity,
  strokeColor = "background.paper",
  strokeWidth = 1.5,
  strokeOpacity = 1,
  beforeId,
  layerOverrides,
  onClick,
}) => {
  const theme = useTheme();
  const reactId = useId();
  const baseId = id ?? `zmap-points-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const layerId = `${baseId}-circle`;

  if (color !== undefined) {
    warnDeprecatedProp("PointLayer", "color", "fillColor");
  }
  if (opacity !== undefined) {
    warnDeprecatedProp("PointLayer", "opacity", "fillOpacity");
  }
  const resolvedFill = fillColor ?? color ?? "primary.main";
  const resolvedFillOpacity = fillOpacity ?? opacity ?? 1;

  const data = useMemo(
    () =>
      featureCollection(
        points.map((p, i) =>
          pointFeature([p.longitude, p.latitude], { _idx: i, ...p.properties }),
        ),
      ),
    [points],
  );

  const layers = useMemo<LayerInput[]>(
    () =>
      applyLayerOverrides(
        [
          {
            id: layerId,
            type: "circle",
            paint: {
              "circle-radius": radius,
              "circle-color": resolvePaletteColor(theme, resolvedFill),
              "circle-opacity": resolvedFillOpacity,
              "circle-stroke-color": resolvePaletteColor(theme, strokeColor),
              "circle-stroke-width": strokeWidth,
              "circle-stroke-opacity": strokeOpacity,
            },
          },
        ],
        layerOverrides,
      ),
    [
      layerId,
      radius,
      resolvedFill,
      resolvedFillOpacity,
      strokeColor,
      strokeWidth,
      strokeOpacity,
      layerOverrides,
      theme,
    ],
  );

  useMapLayer({ id: baseId, data, layers, beforeId });

  useLayerClick(
    layerId,
    onClick
      ? (e) => {
          const f = e.features?.[0];
          const idx = f?.properties?._idx as number | undefined;
          if (idx != null && points[idx]) onClick(points[idx], idx, e);
        }
      : undefined,
  );

  return null;
};

export default PointLayer;

import { useMemo, type FC, type ReactNode } from "react";
import type { GeoJSON } from "geojson";
import type { MapGeoJSONFeature, MapLayerMouseEvent } from "maplibre-gl";
import ShapeLayer from "../ShapeLayer";
import Legend from "../Legend";
import type { ChoroplethSpec } from "../../utils/choropleth";
import { warnDeprecatedProp } from "../../utils/deprecation";
import type { LayerOverride } from "../../utils/layerOverrides";
import type { ControlPosition } from "../MapControls";

export type ChoroplethLegendConfig = {
  /** Heading shown above the legend. */
  title?: ReactNode;
  /** Corner to anchor the legend. Default "bottom-right". */
  position?: ControlPosition;
  /** Format the numeric stop values shown on the legend. */
  formatValue?: (value: number) => string;
};

export type ChoroplethLayerProps = {
  /** Unique source/layer id. Auto-generated when omitted. */
  id?: string;
  /** GeoJSON polygons to color. */
  data: GeoJSON;
  /** Feature property whose numeric value drives the fill color. */
  property: string;
  /** `[value, color]` stops in ascending order; colors may be palette tokens. */
  stops: [number, string][];
  /** "interpolate" (smooth ramp, default) or "step" (banded). */
  scale?: "interpolate" | "step";
  /** Fill opacity, 0–1. Default 0.6. */
  fillOpacity?: number;
  /** Outline color (palette token or CSS). Default "divider". */
  strokeColor?: string;
  /** Outline width in pixels. Default 1. */
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
  /**
   * Render a matching <Legend> from the same stops — pass `true` for defaults,
   * or a config object to set its title, corner, and number format. The legend
   * shares this layer's stops, so the two can never drift apart.
   */
  legend?: boolean | ChoroplethLegendConfig;
};

/**
 * Data-driven polygon fill — a choropleth. Maps a numeric feature property to a
 * color ramp (smooth) or bands ("step"), painting GeoJSON polygons accordingly,
 * and optionally drops a themed <Legend> built from the same stops.
 */
const ChoroplethLayer: FC<ChoroplethLayerProps> = ({
  id,
  data,
  property,
  stops,
  scale = "interpolate",
  fillOpacity = 0.6,
  strokeColor,
  strokeWidth,
  strokeOpacity,
  lineColor,
  lineWidth,
  lineOpacity,
  beforeId,
  layerOverrides,
  onClick,
  legend,
}) => {
  if (lineColor !== undefined) {
    warnDeprecatedProp("ChoroplethLayer", "lineColor", "strokeColor");
  }
  if (lineWidth !== undefined) {
    warnDeprecatedProp("ChoroplethLayer", "lineWidth", "strokeWidth");
  }
  if (lineOpacity !== undefined) {
    warnDeprecatedProp("ChoroplethLayer", "lineOpacity", "strokeOpacity");
  }

  const spec = useMemo<ChoroplethSpec>(
    () => ({ property, stops, type: scale }),
    [property, stops, scale],
  );

  const legendConfig = legend === true ? {} : legend || null;

  return (
    <>
      <ShapeLayer
        id={id}
        data={data}
        fillColor={spec}
        fillOpacity={fillOpacity}
        strokeColor={strokeColor ?? lineColor ?? "divider"}
        strokeWidth={strokeWidth ?? lineWidth ?? 1}
        strokeOpacity={strokeOpacity ?? lineOpacity ?? 1}
        beforeId={beforeId}
        layerOverrides={layerOverrides}
        onClick={onClick}
      />
      {legendConfig && (
        <Legend
          spec={spec}
          title={legendConfig.title}
          position={legendConfig.position}
          formatValue={legendConfig.formatValue}
        />
      )}
    </>
  );
};

export default ChoroplethLayer;

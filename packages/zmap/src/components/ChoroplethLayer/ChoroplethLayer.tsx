import { useMemo, type FC, type ReactNode } from "react";
import type { GeoJSON } from "geojson";
import ShapeLayer from "../ShapeLayer";
import Legend from "../Legend";
import type { ChoroplethSpec } from "../../utils/choropleth";
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
  id?: string;
  /** GeoJSON polygons to color. */
  data: GeoJSON;
  /** Feature property whose numeric value drives the fill color. */
  property: string;
  /** `[value, color]` stops in ascending order; colors may be palette tokens. */
  stops: [number, string][];
  /** "interpolate" (smooth ramp, default) or "step" (banded). */
  scale?: "interpolate" | "step";
  fillOpacity?: number;
  /** Outline color (palette token or CSS). Default "divider". */
  lineColor?: string;
  lineWidth?: number;
  lineOpacity?: number;
  onClick?: (feature: any) => void;
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
  lineColor = "divider",
  lineWidth = 1,
  lineOpacity = 1,
  onClick,
  legend,
}) => {
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
        lineColor={lineColor}
        lineWidth={lineWidth}
        lineOpacity={lineOpacity}
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

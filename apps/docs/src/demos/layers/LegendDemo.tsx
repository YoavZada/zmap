import type { FC } from "react";
import type { FeatureCollection } from "geojson";
import { Map, ShapeLayer, Legend } from "zmapgl";
import type { ChoroplethSpec } from "zmapgl";

function rect(
  name: string,
  [w, s]: [number, number],
  [e, n]: [number, number],
  value: number,
): FeatureCollection["features"][number] {
  return {
    type: "Feature",
    properties: { name, value },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [w, s],
          [e, s],
          [e, n],
          [w, n],
          [w, s],
        ],
      ],
    },
  };
}

const regions: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    rect("Iberia", [-9, 36], [3, 44], 28),
    rect("France", [-1, 43], [7, 51], 64),
    rect("Central EU", [7, 45], [19, 54], 88),
    rect("British Isles", [-8, 50], [2, 59], 45),
  ],
};

// One spec → both the fill and the legend. They can't drift apart.
const sales: ChoroplethSpec = {
  property: "value",
  type: "interpolate", // or "step" for banded swatches
  stops: [
    [0, "info.light"],
    [50, "warning.main"],
    [100, "error.main"],
  ],
};

const LegendDemo: FC = () => {
  return (
    <Map center={[6, 46]} zoom={3.4} sx={{ height: 480, borderRadius: 2 }}>
      <ShapeLayer
        data={regions}
        fillColor={sales}
        lineColor="secondary.main"
        fillOpacity={0.55}
      />

      {/* spec-driven ramp; also: items={[{ color, label }]} for a categorical key */}
      <Legend
        title="Sales by region"
        spec={sales}
        position="bottom-right"
        formatValue={(v) => `$${v}M`}
      />
    </Map>
  );
};

export default LegendDemo;

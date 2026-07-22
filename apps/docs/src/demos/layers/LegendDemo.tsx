import type { FC } from "react";
import { Map, ShapeLayer, Legend } from "zmapgl";
import type { ChoroplethSpec } from "zmapgl";
import { europeSales } from "../../data";

// europeSales: real European country polygons, each carrying a "value" ($M).
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
    <Map center={[12, 51]} zoom={3.1} sx={{ height: 480, borderRadius: 2 }}>
      <ShapeLayer
        data={europeSales}
        fillColor={sales}
        strokeColor="secondary.main"
        strokeWidth={0.75}
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

import type { FC } from "react";
import { Map, MapControls, ExtrusionLayer, Legend } from "zmapgl";
import type { ChoroplethSpec } from "zmapgl";
import { usStates } from "../../data";

// One spec drives both the extrusion color and its legend.
const ramp: ChoroplethSpec = {
  property: "value",
  type: "interpolate",
  stops: [
    [0, "info.light"],
    [80, "warning.light"],
    [300, "warning.main"],
    [900, "error.main"],
  ],
};

const ExtrudedDataDemo: FC = () => {
  return (
    <Map
      center={[-96, 38]}
      zoom={3.2}
      initialView={{ pitch: 50 }}
      sx={{ height: 480, borderRadius: 2 }}
    >
      <MapControls position="top-right" showPitch />

      {/* color AND height both driven by the same value — a 3D choropleth */}
      <ExtrusionLayer
        data={usStates}
        fillColor={ramp}
        heightProperty="value"
        heightScale={450}
        fillOpacity={0.9}
      />
      <Legend
        title="Population density"
        spec={ramp}
        formatValue={(v) => `${v}/mi²`}
      />
    </Map>
  );
};

export default ExtrudedDataDemo;

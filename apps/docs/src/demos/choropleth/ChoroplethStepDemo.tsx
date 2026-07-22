import type { FC } from "react";
import { Map, ChoroplethLayer } from "zmapgl";
import { usStates } from "../../data";

const ChoroplethStepDemo: FC = () => {
  return (
    <Map center={[-96, 38]} zoom={3.2} sx={{ height: 480, borderRadius: 2 }}>
      <ChoroplethLayer
        data={usStates}
        property="value"
        scale="step" // banded instead of a smooth ramp
        stops={[
          [0, "success.light"],
          [50, "info.main"],
          [150, "warning.main"],
          [500, "error.main"],
        ]}
        fillOpacity={0.75}
        legend={{
          title: "Density bands",
          position: "bottom-left",
          formatValue: (v) => `${v}/mi²`,
        }}
      />
    </Map>
  );
};

export default ChoroplethStepDemo;

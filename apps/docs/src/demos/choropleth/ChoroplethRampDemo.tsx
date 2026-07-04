import type { FC } from "react";
import { Map, ChoroplethLayer } from "zmapgl";
import { usStates } from "../../data";

// usStates: a GeoJSON FeatureCollection whose features carry a numeric "value".
const ChoroplethRampDemo: FC = () => {
  return (
    <Map center={[-96, 38]} zoom={3.2} sx={{ height: 480, borderRadius: 2 }}>
      <ChoroplethLayer
        data={usStates}
        property="value" // the numeric property to color by
        stops={[
          [0, "info.light"], // palette tokens or any CSS color
          [150, "warning.light"],
          [300, "warning.main"],
          [450, "error.main"],
        ]}
        fillOpacity={0.7}
        legend={{
          title: "Population density",
          formatValue: (v) => `${v}/mi²`,
        }}
      />
    </Map>
  );
};

export default ChoroplethRampDemo;

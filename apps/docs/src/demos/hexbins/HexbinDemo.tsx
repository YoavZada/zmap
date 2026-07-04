import type { FC } from "react";
import { Map, HexbinLayer, Legend } from "zmapgl";
import { scatterPoints } from "../../data";

// scatterPoints: an array of { longitude, latitude, properties }.
const HexbinDemo: FC = () => {
  return (
    <Map center={[-96, 38]} zoom={3.4} sx={{ height: 480, borderRadius: 2 }}>
      <HexbinLayer points={scatterPoints} radius={70} />
      <Legend
        title="Points per cell"
        items={[
          { color: "error.main", label: "High" },
          { color: "warning.main", label: "Medium" },
          { color: "info.light", label: "Low" },
        ]}
        position="bottom-right"
      />
    </Map>
  );
};

export default HexbinDemo;

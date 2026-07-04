import type { FC } from "react";
import { Map, MapControls, HexbinLayer } from "zmapgl";
import { scatterPoints } from "../../data";

const ExtrudedBinsDemo: FC = () => {
  return (
    <Map
      center={[-118.2, 34.05]}
      zoom={7.8}
      initialView={{ pitch: 55 }}
      sx={{ height: 480, borderRadius: 2 }}
    >
      <MapControls position="top-right" showPitch />
      {/* sum a weight property and raise each bin into a 3D column */}
      <HexbinLayer
        points={scatterPoints}
        radius={16}
        weightProperty="magnitude"
        extruded
        heightScale={700}
      />
    </Map>
  );
};

export default ExtrudedBinsDemo;

import type { FC } from "react";
import { Map, MapControls, ExtrusionLayer } from "zmapgl";
import { buildings } from "../../data";

// buildings: GeoJSON polygons whose features carry a numeric "height" (meters).
const ExtrudedBuildingsDemo: FC = () => {
  return (
    <Map
      center={[-73.984, 40.748]}
      zoom={14.6}
      initialView={{ pitch: 55, bearing: -18 }}
      sx={{ height: 480, borderRadius: 2 }}
    >
      {/* showPitch adds a tilt (3D) toggle to the control cluster */}
      <MapControls position="top-right" showPitch />

      <ExtrusionLayer
        data={buildings}
        heightProperty="height" // drive height from the data
        color="primary.main"
        opacity={0.92}
      />
    </Map>
  );
};

export default ExtrudedBuildingsDemo;

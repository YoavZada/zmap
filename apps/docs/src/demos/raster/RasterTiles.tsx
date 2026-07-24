import type { FC } from "react";
import { Map, RasterLayer } from "zmapgl";

const RasterTiles: FC = () => (
  <Map center={[-98, 39]} zoom={3.5} sx={{ height: 440, borderRadius: 2 }}>
    <RasterLayer
      url="https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}"
      opacity={0.85}
      attribution="Imagery courtesy USGS"
    />
  </Map>
);

export default RasterTiles;

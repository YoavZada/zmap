import type { FC } from "react";
import { GeocoderControl, Map } from "zmapgl";

const BasicGeocoder: FC = () => (
  <Map
    center={[-0.1276, 51.5072]}
    zoom={9}
    sx={{ height: 440, borderRadius: 2 }}
  >
    <GeocoderControl
      onSelect={(result) => console.log(result.name, result.center)}
    />
  </Map>
);

export default BasicGeocoder;

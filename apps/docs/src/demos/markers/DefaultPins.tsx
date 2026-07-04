import type { FC } from "react";
import { Map, Marker } from "zmapgl";
import { cities } from "../../data";

const DefaultPins: FC = () => {
  return (
    <Map center={[2, 30]} zoom={1.3} sx={{ height: 380, borderRadius: 2 }}>
      {cities.map((c) => (
        <Marker
          key={c.name}
          longitude={c.coordinates[0]}
          latitude={c.coordinates[1]}
        />
      ))}
    </Map>
  );
};

export default DefaultPins;

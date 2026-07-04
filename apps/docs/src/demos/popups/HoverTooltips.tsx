import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import LocationCity from "@mui/icons-material/LocationCity";
import { Map, Marker, Tooltip } from "zmapgl";
import { cities } from "../../data";

const HoverTooltips: FC = () => {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <Map center={[10, 25]} zoom={1.2} sx={{ height: 420, borderRadius: 2 }}>
      {cities.map((c) => (
        <Marker
          key={c.name}
          longitude={c.coordinates[0]}
          latitude={c.coordinates[1]}
          anchor="center"
        >
          <Box
            sx={{ display: "flex", cursor: "pointer" }}
            onMouseEnter={() => setHover(c.name)}
            onMouseLeave={() => setHover(null)}
          >
            <LocationCity color="primary" />
          </Box>
        </Marker>
      ))}

      {cities
        .filter((c) => c.name === hover)
        .map((c) => (
          <Tooltip
            key={c.name}
            longitude={c.coordinates[0]}
            latitude={c.coordinates[1]}
            anchor="bottom"
          >
            <b>{c.name}</b>
          </Tooltip>
        ))}
    </Map>
  );
};

export default HoverTooltips;

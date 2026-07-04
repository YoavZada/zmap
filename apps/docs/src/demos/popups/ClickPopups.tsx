import { useState, type FC } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Map, Marker, Popup } from "zmapgl";
import { cities } from "../../data";

const ClickPopups: FC = () => {
  const [open, setOpen] = useState<string | null>("Tokyo");

  return (
    <Map center={[10, 25]} zoom={1.2} sx={{ height: 420, borderRadius: 2 }}>
      {cities.map((c) => (
        <Marker
          key={c.name}
          longitude={c.coordinates[0]}
          latitude={c.coordinates[1]}
          onClick={() => setOpen(c.name)}
        />
      ))}

      {cities
        .filter((c) => c.name === open)
        .map((c) => (
          <Popup
            key={c.name}
            longitude={c.coordinates[0]}
            latitude={c.coordinates[1]}
            offset={28}
            onClose={() => setOpen(null)}
          >
            <Stack spacing={0.5}>
              <Typography fontWeight={700}>{c.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {c.country} · Population {c.population}
              </Typography>
              <Button size="small" sx={{ alignSelf: "flex-start" }}>
                Details
              </Button>
            </Stack>
          </Popup>
        ))}
    </Map>
  );
};

export default ClickPopups;

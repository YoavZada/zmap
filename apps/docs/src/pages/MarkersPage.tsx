import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { Map, Marker } from "zmap";
import DemoSection from "../components/DemoSection";
import { cities } from "../data";

const defaultCode = `<Map center={[2, 30]} zoom={1.4}>
  {cities.map((c) => (
    <Marker
      key={c.name}
      longitude={c.coordinates[0]}
      latitude={c.coordinates[1]}
    />
  ))}
</Map>`;

const customCode = `<Marker longitude={2.3522} latitude={48.8566} anchor="center">
  <Chip
    icon={<RestaurantIcon />}
    label="Le Jules Verne"
    color="primary"
    onClick={() => {}}
  />
</Marker>

<Marker longitude={-0.1276} latitude={51.5072} anchor="center">
  <Avatar sx={{ bgcolor: "secondary.main", border: "2px solid white" }}>
    LDN
  </Avatar>
</Marker>`;

const draggableCode = `const [pos, setPos] = useState<[number, number]>([-74, 40.7]);

<Marker
  longitude={pos[0]}
  latitude={pos[1]}
  draggable
  onDragEnd={(lngLat) => setPos(lngLat)}
/>`;

export function MarkersPage() {
  const [pos, setPos] = useState<[number, number]>([-74.006, 40.7128]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Markers
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 760 }}>
        A <code>Marker</code> places content at a coordinate via a React portal,
        so you can render any MUI element — icons, chips, avatars, cards. With no
        children it falls back to a themed pin.
      </Typography>

      <DemoSection
        title="Default pins"
        description="Render a Marker with no children to get a theme-colored pin."
        code={defaultCode}
        demo={
          <Map center={[2, 30]} zoom={1.3} sx={{ height: 380, borderRadius: 2 }}>
            {cities.map((c) => (
              <Marker
                key={c.name}
                longitude={c.coordinates[0]}
                latitude={c.coordinates[1]}
              />
            ))}
          </Map>
        }
      />

      <DemoSection
        title="Custom MUI markers"
        description="Pass any MUI component as children. Use anchor='center' for badges and chips."
        code={customCode}
        demo={
          <Map center={[1, 50]} zoom={4} sx={{ height: 380, borderRadius: 2 }}>
            <Marker longitude={2.3522} latitude={48.8566} anchor="center">
              <Chip
                icon={<RestaurantIcon />}
                label="Le Jules Verne"
                color="primary"
              />
            </Marker>
            <Marker longitude={-0.1276} latitude={51.5072} anchor="center">
              <Avatar
                sx={{
                  bgcolor: "secondary.main",
                  border: "2px solid white",
                  width: 44,
                  height: 44,
                  fontSize: 14,
                }}
              >
                LDN
              </Avatar>
            </Marker>
          </Map>
        }
      />

      <DemoSection
        title="Draggable markers"
        description="Set draggable and read the new position from onDragEnd."
        code={draggableCode}
        demo={
          <Box>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                label={`lng ${pos[0].toFixed(3)}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`lat ${pos[1].toFixed(3)}`}
                size="small"
                variant="outlined"
              />
            </Stack>
            <Map
              center={[-74.006, 40.7128]}
              zoom={10}
              sx={{ height: 360, borderRadius: 2 }}
            >
              <Marker
                longitude={pos[0]}
                latitude={pos[1]}
                draggable
                onDragEnd={(lngLat) => setPos(lngLat)}
              />
            </Map>
          </Box>
        }
      />
    </Box>
  );
}

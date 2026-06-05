import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import LocationCity from "@mui/icons-material/LocationCity";
import { Map, Marker, Popup, Tooltip } from "zmap";
import DemoSection from "../components/DemoSection";
import { cities } from "../data";

const popupCode = `const [open, setOpen] = useState<string | null>(null);

<Marker
  longitude={c.coordinates[0]}
  latitude={c.coordinates[1]}
  onClick={() => setOpen(c.name)}
/>

{open === c.name && (
  <Popup
    longitude={c.coordinates[0]}
    latitude={c.coordinates[1]}
    offset={28}
    onClose={() => setOpen(null)}
  >
    <Typography fontWeight={700}>{c.name}</Typography>
    <Typography variant="body2">{c.country} · {c.population}</Typography>
    <Button size="small">Details</Button>
  </Popup>
)}`;

const tooltipCode = `const [hover, setHover] = useState<string | null>(null);

<Marker longitude={lng} latitude={lat} anchor="center">
  <Box onMouseEnter={() => setHover(name)} onMouseLeave={() => setHover(null)}>
    <LocationCity color="primary" />
  </Box>
</Marker>

{hover === name && (
  <Tooltip longitude={lng} latitude={lat} anchor="bottom">
    {name}
  </Tooltip>
)}`;

export function PopupsPage() {
  const [open, setOpen] = useState<string | null>("Tokyo");
  const [hover, setHover] = useState<string | null>(null);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Popups & Tooltips
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 760 }}>
        Popups and tooltips render MUI content into a MapLibre overlay, styled to
        match your theme's surface — including dark mode and rounded corners. A{" "}
        <code>Tooltip</code> is a non-interactive popup with no close button.
      </Typography>

      <DemoSection
        title="Click-to-open popups"
        description="Drive visibility with controlled open state; onClose fires when the user dismisses it."
        code={popupCode}
        demo={
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
        }
      />

      <DemoSection
        title="Hover tooltips"
        description="Combine a Marker's hover state with a Tooltip for lightweight labels."
        code={tooltipCode}
        demo={
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
        }
      />
    </Box>
  );
}

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import PublicIcon from "@mui/icons-material/Public";
import PaletteIcon from "@mui/icons-material/Palette";
import LayersIcon from "@mui/icons-material/Layers";
import BoltIcon from "@mui/icons-material/Bolt";
import { Link as RouterLink } from "react-router-dom";
import { Map, MapControls, Marker, Popup } from "zmap";
import { useState } from "react";
import CodeBlock from "../components/CodeBlock";
import { cities } from "../data";

const features = [
  {
    icon: <PaletteIcon color="primary" />,
    title: "MUI-native theming",
    body: "Controls, popups and markers are MUI components. The basemap follows your theme's light/dark mode automatically.",
  },
  {
    icon: <PublicIcon color="primary" />,
    title: "Pluggable providers",
    body: "Ship with CARTO and OpenStreetMap, or drop in any MapLibre style URL or spec — MapTiler, Stadia, self-hosted.",
  },
  {
    icon: <LayersIcon color="primary" />,
    title: "Everything you need",
    body: "Markers, popups, tooltips, controls, routes, arcs and native clustering — composable React components.",
  },
  {
    icon: <BoltIcon color="primary" />,
    title: "Built on MapLibre GL",
    body: "Hardware-accelerated vector maps with zero lock-in. Drop down to the raw map instance whenever you need to.",
  },
];

const installCode = `npm install zmap @mui/material @mui/icons-material \\
  @emotion/react @emotion/styled maplibre-gl`;

const quickStart = `import { Map, MapControls, Marker, Popup } from "zmap";

export function MyMap() {
  return (
    <Map center={[-0.1276, 51.5072]} zoom={11} sx={{ height: 420 }}>
      <MapControls position="top-right" />
      <Marker longitude={-0.1276} latitude={51.5072} />
    </Map>
  );
}`;

export function IntroPage() {
  const [openCity, setOpenCity] = useState<string | null>("London");

  return (
    <Box>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: -1 }}>
          Beautiful maps for MUI apps
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 760 }}>
          <b>zmap</b> is a set of composable, theme-aware map components built on
          MapLibre GL — the map equivalent of the MUI components you already use.
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" component={RouterLink} to="/markers">
            Explore components
          </Button>
          <Button variant="outlined" component={RouterLink} to="/providers">
            Providers & theming
          </Button>
        </Stack>
      </Stack>

      <Map center={[2, 30]} zoom={1.4} sx={{ height: 460, borderRadius: 3, mb: 5 }}>
        <MapControls position="top-right" showScale />
        {cities.map((city) => (
          <Marker
            key={city.name}
            longitude={city.coordinates[0]}
            latitude={city.coordinates[1]}
            onClick={() => setOpenCity(city.name)}
          />
        ))}
        {cities
          .filter((c) => c.name === openCity)
          .map((city) => (
            <Popup
              key={city.name}
              longitude={city.coordinates[0]}
              latitude={city.coordinates[1]}
              offset={28}
              onClose={() => setOpenCity(null)}
            >
              <Typography fontWeight={700}>{city.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {city.country} · {city.population}
              </Typography>
            </Popup>
          ))}
      </Map>

      <Grid container spacing={2} sx={{ mb: 5 }}>
        {features.map((f) => (
          <Grid key={f.title} size={{ xs: 12, sm: 6 }}>
            <Paper variant="outlined" sx={{ p: 2.5, height: "100%", borderRadius: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                {f.icon}
                <Typography fontWeight={700}>{f.title}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {f.body}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" fontWeight={700} gutterBottom>
        Installation
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Install zmap alongside its MUI and MapLibre peers. The MapLibre stylesheet
        is bundled automatically — no extra CSS import required.
      </Typography>
      <Box sx={{ mb: 3 }}>
        <CodeBlock code={installCode} language="bash" />
      </Box>

      <Typography variant="h5" fontWeight={700} gutterBottom>
        Quick start
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Wrap your app in an MUI <code>ThemeProvider</code>, then compose a map:
      </Typography>
      <CodeBlock code={quickStart} />
    </Box>
  );
}

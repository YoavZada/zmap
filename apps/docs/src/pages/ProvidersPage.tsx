import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Alert from "@mui/material/Alert";
import { Map, MapControls, type MapStyleInput } from "zmap";
import DemoSection from "../components/DemoSection";
import Styles from "./providersPage.style";

const code = `import type { FC } from "react";
import { Map, MapControls } from "zmap";

// provider: "carto" (default) | "osm" | a MapProvider | style URL | StyleSpecification
// colorScheme: "auto" (follow MUI theme) | "light" | "dark"
const MyMap: FC = () => {
  return (
    <Map provider="carto" colorScheme="auto" center={[2.2, 41]} zoom={4}>
      <MapControls />
    </Map>
  );
};

export default MyMap;

// Bring your own MapLibre-compatible provider:
// <Map provider="https://tiles.example.com/style.json" />`;

type Scheme = "auto" | "light" | "dark";

export function ProvidersPage() {
  const [provider, setProvider] = useState<MapStyleInput>("carto");
  const [scheme, setScheme] = useState<Scheme>("auto");

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Providers & Theming
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        Switch basemap providers with a single prop. CARTO and OpenStreetMap are
        built in; anything MapLibre-compatible works via a style URL, spec, or a
        custom <code>MapProvider</code>. With <code>colorScheme="auto"</code> the
        basemap tracks the MUI theme — toggle the app theme (top-right) to see it.
      </Typography>

      <DemoSection
        title="Live provider switcher"
        description="CARTO swaps positron ↔ dark-matter with the theme. OpenStreetMap uses a single raster style."
        code={code}
        demo={
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={Styles.controls}
            >
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Provider
                </Typography>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={provider}
                  onChange={(_, v) => v && setProvider(v)}
                >
                  <ToggleButton value="carto">CARTO</ToggleButton>
                  <ToggleButton value="osm">OpenStreetMap</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  colorScheme
                </Typography>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={scheme}
                  onChange={(_, v) => v && setScheme(v)}
                >
                  <ToggleButton value="auto">auto</ToggleButton>
                  <ToggleButton value="light">light</ToggleButton>
                  <ToggleButton value="dark">dark</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>

            <Map
              provider={provider}
              colorScheme={scheme}
              center={[2.2, 41]}
              zoom={3.5}
              sx={Styles.map}
            >
              <MapControls position="top-right" />
            </Map>

            {provider === "osm" && scheme === "dark" && (
              <Alert severity="info" sx={Styles.alert}>
                OpenStreetMap ships a single raster style, so it looks the same in
                light and dark. CARTO provides dedicated dark tiles.
              </Alert>
            )}
          </Box>
        }
      />
    </Box>
  );
}

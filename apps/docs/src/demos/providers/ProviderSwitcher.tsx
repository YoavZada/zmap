import { useState, type FC } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { Map, MapControls, type MapStyleInput } from "zmapgl";

type Scheme = "auto" | "light" | "dark";

// Built-in, no API key: "carto" (default) | "osm" | "versatiles".
// Or bring your own: a style URL, a StyleSpecification, or a MapProvider —
// e.g. <Map provider="https://tiles.example.com/style.json" />.
// colorScheme: "auto" (follow MUI theme) | "light" | "dark"
const ProviderSwitcher: FC = () => {
  const [provider, setProvider] = useState<MapStyleInput>("carto");
  const [scheme, setScheme] = useState<Scheme>("auto");

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
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
            <ToggleButton value="versatiles">VersaTiles</ToggleButton>
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
        sx={{ height: 420, borderRadius: 2 }}
      >
        <MapControls position="top-right" />
      </Map>

      {provider === "osm" && scheme === "dark" && (
        <Alert severity="info" sx={{ mt: 2 }}>
          OpenStreetMap ships a single raster style, so it looks the same in
          light and dark. CARTO and VersaTiles provide dedicated dark tiles.
        </Alert>
      )}
    </Box>
  );
};

export default ProviderSwitcher;

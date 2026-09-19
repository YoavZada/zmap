import { useState, type FC } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { Map, MapControls, arcgis, type MapStyleInput } from "zmapgl";
import { ARCGIS_KEY } from "../../env";

type Scheme = "auto" | "light" | "dark";

type Option = {
  id: string;
  label: string;
  provider: MapStyleInput;
  /** Set when the provider ships one style for both modes. */
  singleStyle?: string;
};

// Built-in, no API key: "carto" (default) | "osm" | "versatiles" | "opentopomap".
// Keyed factories: maptiler(key), arcgis(key). Or bring your own: a style URL,
// a StyleSpecification, or a MapProvider —
// e.g. <Map provider="https://tiles.example.com/style.json" />.
// colorScheme: "auto" (follow MUI theme) | "light" | "dark"
const OPTIONS: Option[] = [
  { id: "carto", label: "CARTO", provider: "carto" },
  {
    id: "osm",
    label: "OpenStreetMap",
    provider: "osm",
    singleStyle:
      "OpenStreetMap ships a single raster style, so it looks the same in light and dark.",
  },
  { id: "versatiles", label: "VersaTiles", provider: "versatiles" },
  {
    id: "opentopomap",
    label: "OpenTopoMap",
    provider: "opentopomap",
    singleStyle:
      "OpenTopoMap ships a single raster style, so it looks the same in light and dark.",
  },
  // ArcGIS needs a key — the toggle only appears when VITE_ARCGIS_KEY is set.
  ...(ARCGIS_KEY
    ? [{ id: "arcgis", label: "ArcGIS", provider: arcgis(ARCGIS_KEY) }]
    : []),
];

const ProviderSwitcher: FC = () => {
  const [id, setId] = useState("carto");
  const [scheme, setScheme] = useState<Scheme>("auto");
  const option = OPTIONS.find((o) => o.id === id) ?? OPTIONS[0];

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
            value={id}
            onChange={(_, v) => v && setId(v)}
          >
            {OPTIONS.map((o) => (
              <ToggleButton key={o.id} value={o.id}>
                {o.label}
              </ToggleButton>
            ))}
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
        provider={option.provider}
        colorScheme={scheme}
        center={[2.2, 41]}
        zoom={3.5}
        sx={{ height: 420, borderRadius: 2 }}
      >
        <MapControls position="top-right" />
      </Map>

      {option.singleStyle && scheme === "dark" && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {option.singleStyle} CARTO, VersaTiles and ArcGIS provide dedicated
          dark styles.
        </Alert>
      )}
    </Box>
  );
};

export default ProviderSwitcher;

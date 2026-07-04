import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Map, type MapViewState } from "zmapgl";

const CITIES: Record<string, MapViewState> = {
  London: { center: [-0.1276, 51.5072], zoom: 11 },
  Paris: { center: [2.3522, 48.8566], zoom: 11 },
  Rome: { center: [12.4964, 41.9028], zoom: 11 },
};

const EUROPE: [[number, number], [number, number]] = [
  [-11, 35],
  [32, 60],
];

const DeclarativeCameraDemo: FC = () => {
  const [city, setCity] = useState<string | null>("London");
  const [bounds, setBounds] = useState<typeof EUROPE>();

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={city}
          onChange={(_, v: string | null) => {
            if (!v) return;
            setCity(v);
            setBounds(undefined);
          }}
        >
          {Object.keys(CITIES).map((name) => (
            <ToggleButton key={name} value={name}>
              {name}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setBounds(EUROPE);
            setCity(null);
          }}
        >
          Fit Europe
        </Button>
      </Stack>

      {/* view eases the camera whenever it changes; the user can still pan
          freely in between. fitBounds refits when the bounds value changes. */}
      <Map
        initialView={CITIES.London}
        view={city ? CITIES[city] : undefined}
        fitBounds={bounds}
        fitBoundsOptions={{ padding: 40 }}
        sx={{ height: 440, borderRadius: 2 }}
      />
    </Box>
  );
};

export default DeclarativeCameraDemo;

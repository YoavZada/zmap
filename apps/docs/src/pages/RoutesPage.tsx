import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { Map, Marker, Route } from "zmap";
import DemoSection from "../components/DemoSection";
import { londonRoute } from "../data";

const code = `import { Map, Route, Marker } from "zmap";

const path = [
  [-0.1419, 51.5014],
  [-0.1281, 51.5074],
  [-0.1246, 51.5081],
  [-0.1057, 51.5079],
  [-0.0759, 51.5081],
];

<Map center={[-0.11, 51.506]} zoom={13}>
  <Route coordinates={path} color="primary.main" width={5} />
  <Marker longitude={path[0][0]} latitude={path[0][1]} />
  <Marker longitude={path.at(-1)[0]} latitude={path.at(-1)[1]} />
</Map>`;

export function RoutesPage() {
  const [width, setWidth] = useState(5);
  const [dashed, setDashed] = useState(false);

  const start = londonRoute[0];
  const end = londonRoute[londonRoute.length - 1];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Routes
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 760 }}>
        <code>Route</code> draws a polyline from a list of coordinates as a
        GPU-rendered line layer. Colors accept MUI palette tokens like{" "}
        <code>"primary.main"</code>, and the line survives theme changes.
      </Typography>

      <DemoSection
        title="A walking route through London"
        description="Adjust the stroke and toggle a dashed style."
        code={code}
        demo={
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              alignItems={{ sm: "center" }}
              sx={{ mb: 2 }}
            >
              <Box sx={{ width: 220 }}>
                <Typography variant="caption" color="text.secondary">
                  Width: {width}px
                </Typography>
                <Slider
                  size="small"
                  min={1}
                  max={12}
                  value={width}
                  onChange={(_, v) => setWidth(v as number)}
                />
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={dashed}
                    onChange={(e) => setDashed(e.target.checked)}
                  />
                }
                label="Dashed"
              />
            </Stack>

            <Map
              center={[-0.108, 51.506]}
              zoom={13}
              sx={{ height: 440, borderRadius: 2 }}
            >
              <Route
                coordinates={londonRoute}
                color="primary.main"
                width={width}
                dashed={dashed}
              />
              <Marker longitude={start[0]} latitude={start[1]} />
              <Marker longitude={end[0]} latitude={end[1]} />
            </Map>
          </Box>
        }
      />
    </Box>
  );
}

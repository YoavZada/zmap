import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { Map, Marker, Route } from "zmapgl";
import { londonRoute } from "../../data";

const RouteDemo: FC = () => {
  const [width, setWidth] = useState(5);
  const [dashed, setDashed] = useState(false);

  const start = londonRoute[0];
  const end = londonRoute[londonRoute.length - 1];

  return (
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
  );
};

export default RouteDemo;

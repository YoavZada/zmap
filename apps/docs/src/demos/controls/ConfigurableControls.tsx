import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Map, MapControls, type ControlPosition } from "zmapgl";

const ConfigurableControls: FC = () => {
  const [position, setPosition] = useState<ControlPosition>("top-right");
  const [showZoom, setShowZoom] = useState(true);
  const [showCompass, setShowCompass] = useState(true);
  const [showGeolocate, setShowGeolocate] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(true);
  const [showScale, setShowScale] = useState(true);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ md: "center" }}
        sx={{ mb: 2 }}
      >
        <ToggleButtonGroup
          size="small"
          exclusive
          value={position}
          onChange={(_, v) => v && setPosition(v)}
        >
          <ToggleButton value="top-left">top-left</ToggleButton>
          <ToggleButton value="top-right">top-right</ToggleButton>
          <ToggleButton value="bottom-left">bottom-left</ToggleButton>
          <ToggleButton value="bottom-right">bottom-right</ToggleButton>
        </ToggleButtonGroup>
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={showZoom}
                onChange={(e) => setShowZoom(e.target.checked)}
              />
            }
            label="Zoom"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showCompass}
                onChange={(e) => setShowCompass(e.target.checked)}
              />
            }
            label="Compass"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showGeolocate}
                onChange={(e) => setShowGeolocate(e.target.checked)}
              />
            }
            label="Geolocate"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showFullscreen}
                onChange={(e) => setShowFullscreen(e.target.checked)}
              />
            }
            label="Fullscreen"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showScale}
                onChange={(e) => setShowScale(e.target.checked)}
              />
            }
            label="Scale"
          />
        </FormGroup>
      </Stack>

      <Map
        center={[2.3522, 48.8566]}
        zoom={11}
        mapOptions={{ pitch: 30 }}
        sx={{ height: 440, borderRadius: 2 }}
      >
        <MapControls
          position={position}
          showZoom={showZoom}
          showCompass={showCompass}
          showGeolocate={showGeolocate}
          showFullscreen={showFullscreen}
          showScale={showScale}
        />
      </Map>
    </Box>
  );
};

export default ConfigurableControls;

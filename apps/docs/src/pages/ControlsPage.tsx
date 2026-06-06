import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Map, MapControls, type ControlPosition } from "zmapgl";
import DemoSection from "../components/DemoSection";
import Styles from "./controlsPage.style";

const code = `import type { FC } from "react";
import { Map, MapControls } from "zmapgl";

const MyMap: FC = () => {
  return (
    <Map center={[2.3522, 48.8566]} zoom={11} mapOptions={{ pitch: 30 }}>
      <MapControls
        position="top-right"
        showZoom
        showCompass
        showGeolocate
        showFullscreen
        showScale
        scalePosition="bottom-left"
      />
    </Map>
  );
};

export default MyMap;`;

export function ControlsPage() {
  const [position, setPosition] = useState<ControlPosition>("top-right");
  const [showZoom, setShowZoom] = useState(true);
  const [showCompass, setShowCompass] = useState(true);
  const [showGeolocate, setShowGeolocate] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(true);
  const [showScale, setShowScale] = useState(true);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Controls
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        <code>MapControls</code> is a cluster of MUI buttons — zoom, compass
        (drag to rotate, then click to reset north), geolocate, and fullscreen —
        plus an optional scale bar. Because it's plain MUI, it inherits your
        theme automatically.
      </Typography>

      <DemoSection
        title="Configurable controls"
        description="Toggle individual controls and reposition the cluster. Drag with right-click to rotate, then use the compass."
        code={code}
        demo={
          <Box>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ md: "center" }}
              sx={Styles.controls}
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
              sx={Styles.map}
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
        }
      />
    </Box>
  );
}

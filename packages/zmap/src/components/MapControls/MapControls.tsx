import { useCallback, useEffect, useState, type FC } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
import Navigation from "@mui/icons-material/Navigation";
import MyLocation from "@mui/icons-material/MyLocation";
import Fullscreen from "@mui/icons-material/Fullscreen";
import FullscreenExit from "@mui/icons-material/FullscreenExit";
import ViewInAr from "@mui/icons-material/ViewInAr";
import { useMapContext } from "../../context/useMap";
import Styles from "./mapControls.style";

/** Which corner of the map a control is anchored to. */
export type ControlPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/** Props for `<MapControls>`, a cluster of MUI-styled map controls (zoom, compass, geolocate, fullscreen, scale). */
export interface MapControlsProps {
  /** Corner for the zoom/compass/geolocate/fullscreen cluster. */
  position?: ControlPosition;
  /** Show the zoom in/out buttons. Default true. */
  showZoom?: boolean;
  /** Show the compass (reset-north) button. Default true. */
  showCompass?: boolean;
  /** Show the "my location" button. Default true. */
  showGeolocate?: boolean;
  /** Show the fullscreen toggle. Default true. */
  showFullscreen?: boolean;
  /** Show a 3D tilt toggle that pitches the camera (for fill-extrusion layers). */
  showPitch?: boolean;
  /** Pitch (degrees) the tilt toggle eases to. Default 60. */
  pitchAmount?: number;
  /** Show a scale bar. Default false. */
  showScale?: boolean;
  /** Corner for the scale bar. Default "bottom-left". */
  scalePosition?: ControlPosition;
  /** Scale bar units. Default "metric". */
  scaleUnit?: "metric" | "imperial";
}

function niceRound(value: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const d = value / pow;
  const nice = d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;
  return nice * pow;
}

function ScaleBar({
  position,
  unit,
}: {
  position: ControlPosition;
  unit: "metric" | "imperial";
}) {
  const { map } = useMapContext();
  const [state, setState] = useState<{ width: number; label: string } | null>(
    null,
  );

  useEffect(() => {
    if (!map) return;
    const maxWidth = 100;
    const update = () => {
      const y = map.getContainer().clientHeight / 2;
      const left = map.unproject([0, y]);
      const right = map.unproject([maxWidth, y]);
      const maxMeters = left.distanceTo(right);
      if (!isFinite(maxMeters) || maxMeters <= 0) return;

      if (unit === "imperial") {
        const maxFeet = maxMeters * 3.28084;
        if (maxFeet > 5280) {
          const miles = niceRound(maxFeet / 5280);
          setState({
            width: (maxWidth * ((miles * 5280) / maxFeet)) | 0,
            label: `${miles} mi`,
          });
        } else {
          const feet = niceRound(maxFeet);
          setState({
            width: (maxWidth * (feet / maxFeet)) | 0,
            label: `${feet} ft`,
          });
        }
      } else {
        const meters = niceRound(maxMeters);
        const label = meters >= 1000 ? `${meters / 1000} km` : `${meters} m`;
        setState({ width: (maxWidth * (meters / maxMeters)) | 0, label });
      }
    };
    update();
    map.on("move", update);
    return () => {
      map.off("move", update);
    };
  }, [map, unit]);

  if (!state) return null;

  return (
    <Box sx={Styles.scaleRoot(position)}>
      <Box sx={Styles.scaleBar(state.width)}>
        <Typography variant="caption" sx={Styles.scaleLabel}>
          {state.label}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * A cluster of MUI-styled map controls. Because it is plain MUI, it inherits the
 * app's theme automatically (light/dark, colors, shape).
 */
const MapControls: FC<MapControlsProps> = ({
  position = "top-right",
  showZoom = true,
  showCompass = true,
  showGeolocate = true,
  showFullscreen = true,
  showPitch = false,
  pitchAmount = 60,
  showScale = false,
  scalePosition = "bottom-left",
  scaleUnit = "metric",
}) => {
  const { map } = useMapContext();
  const [bearing, setBearing] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!map) return;
    const onRotate = () => setBearing(map.getBearing());
    onRotate();
    map.on("rotate", onRotate);
    return () => {
      map.off("rotate", onRotate);
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    const onPitch = () => setPitch(map.getPitch());
    onPitch();
    map.on("pitch", onPitch);
    return () => {
      map.off("pitch", onPitch);
    };
  }, [map]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const zoomIn = useCallback(() => map?.zoomIn(), [map]);
  const zoomOut = useCallback(() => map?.zoomOut(), [map]);
  const resetNorth = useCallback(() => map?.resetNorth(), [map]);

  const tilted = pitch > 1;
  const togglePitch = useCallback(() => {
    map?.easeTo({ pitch: map.getPitch() > 1 ? 0 : pitchAmount });
  }, [map, pitchAmount]);

  const geolocate = useCallback(() => {
    if (!map || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: Math.max(map.getZoom(), 14),
        });
      },
      undefined,
      { enableHighAccuracy: true },
    );
  }, [map]);

  const toggleFullscreen = useCallback(() => {
    if (!map) return;
    const container = map.getContainer();
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void container.requestFullscreen?.();
    }
  }, [map]);

  return (
    <>
      <Paper elevation={3} sx={Styles.panel(position)}>
        <Stack direction="column" divider={<Divider flexItem />}>
          {showZoom && (
            <Stack direction="column" divider={<Divider flexItem />}>
              <Tooltip title="Zoom in" placement="left">
                <IconButton size="small" onClick={zoomIn} aria-label="Zoom in">
                  <Add fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom out" placement="left">
                <IconButton
                  size="small"
                  onClick={zoomOut}
                  aria-label="Zoom out"
                >
                  <Remove fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}

          {showCompass && (
            <Tooltip title="Reset bearing" placement="left">
              <IconButton
                size="small"
                onClick={resetNorth}
                aria-label="Reset bearing to north"
              >
                <Navigation fontSize="small" sx={Styles.compass(bearing)} />
              </IconButton>
            </Tooltip>
          )}

          {showPitch && (
            <Tooltip
              title={tilted ? "Reset tilt" : "Tilt (3D)"}
              placement="left"
            >
              <IconButton
                size="small"
                onClick={togglePitch}
                aria-label="Toggle 3D tilt"
                color={tilted ? "primary" : "default"}
              >
                <ViewInAr fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {showGeolocate && (
            <Tooltip title="My location" placement="left">
              <IconButton
                size="small"
                onClick={geolocate}
                aria-label="Go to my location"
              >
                <MyLocation fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {showFullscreen && (
            <Tooltip
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              placement="left"
            >
              <IconButton
                size="small"
                onClick={toggleFullscreen}
                aria-label="Toggle fullscreen"
              >
                {isFullscreen ? (
                  <FullscreenExit fontSize="small" />
                ) : (
                  <Fullscreen fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Paper>

      {showScale && <ScaleBar position={scalePosition} unit={scaleUnit} />}
    </>
  );
};

export default MapControls;

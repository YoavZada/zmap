import type { FC } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Pause from "@mui/icons-material/Pause";
import Replay from "@mui/icons-material/Replay";
import type { ControlPosition } from "../../../MapControls";
import Styles from "./transportBar.style";

export type TransportBarProps = {
  position: ControlPosition;
  playing: boolean;
  /** Playhead is at the end of the range (shows a replay affordance). */
  atEnd: boolean;
  playhead: number;
  min: number;
  max: number;
  /** Current playback speed multiplier (shown on the cycle button). */
  speed: number;
  format: (value: number) => string;
  onToggle: () => void;
  onScrub: (value: number) => void;
  onCycleSpeed: () => void;
};

/** The themed play/scrub/speed bar floating over the map. */
const TransportBar: FC<TransportBarProps> = ({
  position,
  playing,
  atEnd,
  playhead,
  min,
  max,
  speed,
  format,
  onToggle,
  onScrub,
  onCycleSpeed,
}) => {
  return (
    <Paper elevation={3} sx={Styles.transport(position)}>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Tooltip title={playing ? "Pause" : "Play"} placement="top">
          <IconButton
            size="small"
            onClick={onToggle}
            aria-label={playing ? "Pause" : "Play"}
          >
            {atEnd && !playing ? (
              <Replay fontSize="small" />
            ) : playing ? (
              <Pause fontSize="small" />
            ) : (
              <PlayArrow fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        <Slider
          size="small"
          min={min}
          max={max}
          value={playhead}
          onChange={(_, v) => onScrub(v as number)}
          aria-label="Playhead"
          sx={Styles.slider}
        />

        <Typography variant="caption" sx={Styles.time}>
          {format(playhead)}
        </Typography>

        <Tooltip title="Playback speed" placement="top">
          <Button
            size="small"
            color="inherit"
            onClick={onCycleSpeed}
            sx={Styles.speed}
          >
            {speed}×
          </Button>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

export default TransportBar;

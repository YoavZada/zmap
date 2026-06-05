import type { SxProps, Theme } from "@mui/material/styles";
import type { ControlPosition } from "./MapControls";

const OFFSETS: Record<ControlPosition, Record<string, number>> = {
  "top-left": { top: 8, left: 8 },
  "top-right": { top: 8, right: 8 },
  "bottom-left": { bottom: 8, left: 8 },
  "bottom-right": { bottom: 8, right: 8 },
};

const panel = (position: ControlPosition): SxProps<Theme> => ({
  position: "absolute",
  zIndex: 2,
  overflow: "hidden",
  ...OFFSETS[position],
});

const scaleRoot = (position: ControlPosition): SxProps<Theme> => ({
  position: "absolute",
  zIndex: 1,
  pointerEvents: "none",
  ...OFFSETS[position],
});

const scaleBar = (width: number): SxProps<Theme> => ({
  width,
  px: 0.5,
  borderLeft: 2,
  borderRight: 2,
  borderBottom: 2,
  borderColor: "text.secondary",
  bgcolor: "background.paper",
  opacity: 0.85,
  borderRadius: "0 0 2px 2px",
});

const scaleLabel: SxProps<Theme> = {
  display: "block",
  textAlign: "center",
  lineHeight: 1.4,
};

const compass = (bearing: number): SxProps<Theme> => ({
  transform: `rotate(${-bearing}deg)`,
});

const styles: {
  panel: (position: ControlPosition) => SxProps<Theme>;
  scaleRoot: (position: ControlPosition) => SxProps<Theme>;
  scaleBar: (width: number) => SxProps<Theme>;
  scaleLabel: SxProps<Theme>;
  compass: (bearing: number) => SxProps<Theme>;
} = { panel, scaleRoot, scaleBar, scaleLabel, compass };
export default styles;

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
  p: 1,
  minWidth: 132,
  maxWidth: 240,
  ...OFFSETS[position],
});

const title: SxProps<Theme> = {
  display: "block",
  fontWeight: 700,
  mb: 0.75,
  lineHeight: 1.2,
};

// Continuous ramp — a CSS linear-gradient built from the resolved stop colors.
const gradientBar = (gradient: string): SxProps<Theme> => ({
  height: 10,
  borderRadius: 0.5,
  background: gradient,
  border: 1,
  borderColor: "divider",
});

// Tick labels sit in-flow under the bar so they give the panel a real width and
// can never overlap (flex items reflow); the gap keeps them from touching. For
// evenly-spaced stops, space-between lands each label under its gradient stop.
const ticks: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 0.75,
  mt: 0.5,
};

const tick: SxProps<Theme> = {
  whiteSpace: "nowrap",
  color: "text.secondary",
  lineHeight: 1.2,
};

const list: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
};

const itemRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
};

const swatch = (color: string): SxProps<Theme> => ({
  flex: "0 0 auto",
  width: 14,
  height: 14,
  borderRadius: 0.5,
  bgcolor: color,
  border: 1,
  borderColor: "divider",
});

const itemLabel: SxProps<Theme> = {
  lineHeight: 1.3,
  color: "text.secondary",
};

const styles: {
  panel: (position: ControlPosition) => SxProps<Theme>;
  title: SxProps<Theme>;
  gradientBar: (gradient: string) => SxProps<Theme>;
  ticks: SxProps<Theme>;
  tick: SxProps<Theme>;
  list: SxProps<Theme>;
  itemRow: SxProps<Theme>;
  swatch: (color: string) => SxProps<Theme>;
  itemLabel: SxProps<Theme>;
} = {
  panel,
  title,
  gradientBar,
  ticks,
  tick,
  list,
  itemRow,
  swatch,
  itemLabel,
};

export default styles;

import type { SxProps, Theme } from "@mui/material/styles";
import type { ControlPosition } from "../../../MapControls";

const OFFSETS: Record<ControlPosition, Record<string, number>> = {
  "top-left": { top: 8, left: 8 },
  "top-right": { top: 8, right: 8 },
  "bottom-left": { bottom: 8, left: 8 },
  "bottom-right": { bottom: 8, right: 8 },
};

const transport = (position: ControlPosition): SxProps<Theme> => ({
  position: "absolute",
  zIndex: 2,
  px: 1.25,
  py: 0.5,
  width: 340,
  maxWidth: "calc(100% - 16px)",
  ...OFFSETS[position],
});

const slider: SxProps<Theme> = {
  flex: 1,
  mx: 0.5,
};

const time: SxProps<Theme> = {
  width: 56,
  flexShrink: 0,
  textAlign: "right",
  color: "text.secondary",
  fontVariantNumeric: "tabular-nums",
};

const speed: SxProps<Theme> = {
  minWidth: 40,
  px: 0.5,
  flexShrink: 0,
  fontVariantNumeric: "tabular-nums",
};

const styles: {
  transport: (position: ControlPosition) => SxProps<Theme>;
  slider: SxProps<Theme>;
  time: SxProps<Theme>;
  speed: SxProps<Theme>;
} = { transport, slider, time, speed };

export default styles;

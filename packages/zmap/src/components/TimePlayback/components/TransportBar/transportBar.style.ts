import type { SxProps, Theme } from "@mui/material/styles";
import type { ControlPosition } from "../../../MapControls";
import { CONTROL_OFFSETS } from "../../../../utils/controlPosition";

const transport = (position: ControlPosition): SxProps<Theme> => ({
  position: "absolute",
  zIndex: 2,
  px: 1.25,
  py: 0.5,
  width: 340,
  maxWidth: "calc(100% - 16px)",
  ...CONTROL_OFFSETS[position],
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

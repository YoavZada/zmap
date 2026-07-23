import type { SxProps, Theme } from "@mui/material/styles";
import type { ControlPosition } from "../MapControls";

const OFFSETS: Record<ControlPosition, Record<string, number>> = {
  "top-left": { top: 8, left: 8 },
  "top-right": { top: 8, right: 8 },
  "bottom-left": { bottom: 8, left: 8 },
  "bottom-right": { bottom: 8, right: 8 },
};

const root = (position: ControlPosition): SxProps<Theme> => ({
  position: "absolute",
  zIndex: 2,
  width: 280,
  maxWidth: "calc(100% - 16px)",
  ...OFFSETS[position],
});

const styles: {
  root: (position: ControlPosition) => SxProps<Theme>;
} = { root };
export default styles;

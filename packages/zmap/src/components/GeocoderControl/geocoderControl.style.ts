import type { SxProps, Theme } from "@mui/material/styles";
import type { ControlPosition } from "../MapControls";
import { CONTROL_OFFSETS } from "../../utils/controlPosition";

const root = (position: ControlPosition): SxProps<Theme> => ({
  position: "absolute",
  zIndex: 2,
  width: 280,
  maxWidth: "calc(100% - 16px)",
  ...CONTROL_OFFSETS[position],
});

const styles: {
  root: (position: ControlPosition) => SxProps<Theme>;
} = { root };
export default styles;

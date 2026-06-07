import type { SxProps, Theme } from "@mui/material/styles";
import type { ControlPosition } from "./MapControls";
import { controlPanel } from "../utils/controlPosition";

const panel = (position: ControlPosition): SxProps<Theme> =>
  controlPanel(position);

const toolButton =
  (active: boolean): SxProps<Theme> =>
  (theme) => ({
    borderRadius: 0,
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    bgcolor: active ? theme.palette.action.selected : "transparent",
  });

// Full-bleed, click-through layer that hosts the marquee/lasso SVG.
const overlay: SxProps<Theme> = {
  position: "absolute",
  inset: 0,
  zIndex: 1,
  pointerEvents: "none",
  overflow: "hidden",
};

const styles: {
  panel: (position: ControlPosition) => SxProps<Theme>;
  toolButton: (active: boolean) => SxProps<Theme>;
  overlay: SxProps<Theme>;
} = { panel, toolButton, overlay };

export default styles;

import type { SxProps, Theme } from "@mui/material/styles";
import type { ControlPosition } from "../MapControls";
import { controlPanel } from "../../utils/controlPosition";

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

const svg: SxProps<Theme> = {
  width: "100%",
  height: "100%",
  display: "block",
};

// Small themed pill announcing a pending keyboard-box corner.
const kbHint: SxProps<Theme> = (theme) => ({
  position: "absolute",
  bottom: 16,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 3,
  px: 1.5,
  py: 0.5,
  borderRadius: 999,
  bgcolor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[3],
  fontSize: theme.typography.pxToRem(12),
  pointerEvents: "none",
});

const styles: {
  panel: (position: ControlPosition) => SxProps<Theme>;
  toolButton: (active: boolean) => SxProps<Theme>;
  overlay: SxProps<Theme>;
  svg: SxProps<Theme>;
  kbHint: SxProps<Theme>;
} = { panel, toolButton, overlay, svg, kbHint };

export default styles;

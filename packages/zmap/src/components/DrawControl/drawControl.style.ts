import type { SxProps, Theme } from "@mui/material/styles";
import type { ControlPosition } from "../MapControls";
import { controlPanel } from "../../utils/controlPosition";

const panel = (position: ControlPosition): SxProps<Theme> =>
  controlPanel(position);

// Square, flush toolbar buttons; the armed tool gets a tinted, primary-colored
// state so the active mode reads at a glance.
const toolButton =
  (active: boolean): SxProps<Theme> =>
  (theme) => ({
    borderRadius: 0,
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    bgcolor: active ? theme.palette.action.selected : "transparent",
  });

const styles: {
  panel: (position: ControlPosition) => SxProps<Theme>;
  toolButton: (active: boolean) => SxProps<Theme>;
} = { panel, toolButton };

export default styles;

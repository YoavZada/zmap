import type { SxProps, Theme } from "@mui/material/styles";
import type { ControlPosition } from "../MapControls";
import { CONTROL_OFFSETS, controlPanel } from "../../utils/controlPosition";

const panel = (position: ControlPosition): SxProps<Theme> =>
  controlPanel(position);

const toolButton =
  (active: boolean): SxProps<Theme> =>
  (theme) => ({
    borderRadius: 0,
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    bgcolor: active ? theme.palette.action.selected : "transparent",
  });

// A column of measurement chips pinned to a corner; right-side corners stack
// their chips flush to the right so they don't crowd the toolbar.
const readout = (position: ControlPosition): SxProps<Theme> => ({
  position: "absolute",
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
  maxWidth: 220,
  alignItems: position.endsWith("right") ? "flex-end" : "flex-start",
  ...CONTROL_OFFSETS[position],
});

const styles: {
  panel: (position: ControlPosition) => SxProps<Theme>;
  toolButton: (active: boolean) => SxProps<Theme>;
  readout: (position: ControlPosition) => SxProps<Theme>;
} = { panel, toolButton, readout };

export default styles;

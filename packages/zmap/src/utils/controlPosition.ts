import type { SxProps, Theme } from "@mui/material/styles";
import type { ControlPosition } from "../components/MapControls";

/** Absolute corner offsets shared by every floating map control. */
export const CONTROL_OFFSETS: Record<
  ControlPosition,
  Record<string, number>
> = {
  "top-left": { top: 8, left: 8 },
  "top-right": { top: 8, right: 8 },
  "bottom-left": { bottom: 8, left: 8 },
  "bottom-right": { bottom: 8, right: 8 },
};

/** A floating control panel pinned to a corner — the base for toolbars. */
export const controlPanel = (position: ControlPosition): SxProps<Theme> => ({
  position: "absolute",
  zIndex: 2,
  overflow: "hidden",
  ...CONTROL_OFFSETS[position],
});

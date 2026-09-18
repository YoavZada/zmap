import type { SxProps, Theme } from "@mui/material/styles";
import type { ControlPosition } from "../components/MapControls";

/**
 * Absolute corner offsets shared by every floating map control. Uses logical
 * `insetInlineStart`/`insetInlineEnd` (not physical `left`/`right`), so in an
 * LTR document `top-left` renders top-left as usual, but under `dir="rtl"`
 * (what MUI RTL apps set on an ancestor) the corners mirror — `top-left`
 * renders on the visual right — matching what an RTL layout expects.
 */
export const CONTROL_OFFSETS: Record<
  ControlPosition,
  Record<string, number>
> = {
  "top-left": { top: 8, insetInlineStart: 8 },
  "top-right": { top: 8, insetInlineEnd: 8 },
  "bottom-left": { bottom: 8, insetInlineStart: 8 },
  "bottom-right": { bottom: 8, insetInlineEnd: 8 },
};

/** A floating control panel pinned to a corner — the base for toolbars. */
export const controlPanel = (position: ControlPosition): SxProps<Theme> => ({
  position: "absolute",
  zIndex: 2,
  overflow: "hidden",
  ...CONTROL_OFFSETS[position],
});

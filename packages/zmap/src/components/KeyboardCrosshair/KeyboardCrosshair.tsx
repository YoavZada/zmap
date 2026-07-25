import type { FC } from "react";
import Box from "@mui/material/Box";
import Styles from "./keyboardCrosshair.style";

/**
 * A center crosshair reticle shown while a drawing/selection tool is armed, so
 * keyboard users can aim with arrow-key panning and place a vertex at center.
 * Decorative — hidden from assistive tech.
 */
const KeyboardCrosshair: FC = () => (
  <Box aria-hidden sx={Styles.root}>
    <Box
      component="svg"
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <line x1="14" y1="2" x2="14" y2="10" />
      <line x1="14" y1="18" x2="14" y2="26" />
      <line x1="2" y1="14" x2="10" y2="14" />
      <line x1="18" y1="14" x2="26" y2="14" />
      <circle cx="14" cy="14" r="2" fill="currentColor" stroke="none" />
    </Box>
  </Box>
);

export default KeyboardCrosshair;

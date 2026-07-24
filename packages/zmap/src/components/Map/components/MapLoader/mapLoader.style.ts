import type { SxProps, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

// Sits above the map canvas and chrome (MapControls use zIndex 2).
const OVERLAY_Z = 3;

// The frosted "loader screen": a full-cover, blurred, semi-transparent scrim.
const overlay: SxProps<Theme> = (theme) => ({
  position: "absolute",
  inset: 0,
  zIndex: OVERLAY_Z,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  bgcolor: alpha(theme.palette.background.default, 0.6),
});

// The bare "loader icon": centered, no scrim — the basemap shows through.
const spinner: SxProps<Theme> = {
  position: "absolute",
  inset: 0,
  zIndex: OVERLAY_Z,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
};

// The slim "progress bar": pinned to the top edge, non-blocking.
const bar: SxProps<Theme> = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: OVERLAY_Z,
};

const container: Record<"overlay" | "spinner" | "bar", SxProps<Theme>> = {
  overlay,
  spinner,
  bar,
};

// Centered column shared by the overlay/spinner variants.
const content: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 1.5,
};

// Text under the spinner (overlay/spinner variants).
const label: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
});

// Small caption beneath the bar (bar variant).
const barLabel: SxProps<Theme> = (theme) => ({
  display: "block",
  px: 1.5,
  py: 0.5,
  color: theme.palette.text.secondary,
  bgcolor: alpha(theme.palette.background.default, 0.6),
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
});

const styles: {
  container: Record<"overlay" | "spinner" | "bar", SxProps<Theme>>;
  content: SxProps<Theme>;
  label: SxProps<Theme>;
  barLabel: SxProps<Theme>;
} = { container, content, label, barLabel };

export default styles;

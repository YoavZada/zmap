import type { SxProps, Theme } from "@mui/material/styles";

const intro: SxProps<Theme> = { mb: 3, maxWidth: 760 };

const controls: SxProps<Theme> = { mb: 2 };

// Dim the curvature slider when it doesn't apply (geodesic).
const curvatureBox = (enabled: boolean): SxProps<Theme> => ({
  width: 240,
  opacity: enabled ? 1 : 0.4,
});

// Endpoint dot tinted with the arc's palette color.
const dot = (color: string): SxProps<Theme> => ({
  width: 10,
  height: 10,
  borderRadius: "50%",
  bgcolor: color,
  border: "2px solid",
  borderColor: "background.paper",
});

const map: SxProps<Theme> = { height: 460, borderRadius: 2 };

const styles: {
  intro: SxProps<Theme>;
  controls: SxProps<Theme>;
  curvatureBox: (enabled: boolean) => SxProps<Theme>;
  dot: (color: string) => SxProps<Theme>;
  map: SxProps<Theme>;
} = { intro, controls, curvatureBox, dot, map };

export default styles;

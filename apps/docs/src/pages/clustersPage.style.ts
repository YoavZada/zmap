import type { SxProps, Theme } from "@mui/material/styles";

const intro: SxProps<Theme> = { mb: 3, maxWidth: 760 };

const controls: SxProps<Theme> = { mb: 2 };

const sliderBox: SxProps<Theme> = { width: 240 };

const map: SxProps<Theme> = { height: 480, borderRadius: 2 };

const styles: Record<
  "intro" | "controls" | "sliderBox" | "map",
  SxProps<Theme>
> = { intro, controls, sliderBox, map };

export default styles;

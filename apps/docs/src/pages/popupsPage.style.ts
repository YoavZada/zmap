import type { SxProps, Theme } from "@mui/material/styles";

const intro: SxProps<Theme> = { mb: 3, maxWidth: 760 };

const map: SxProps<Theme> = { height: 420, borderRadius: 2 };

const popupButton: SxProps<Theme> = { alignSelf: "flex-start" };

const hoverTarget: SxProps<Theme> = { display: "flex", cursor: "pointer" };

const styles: Record<
  "intro" | "map" | "popupButton" | "hoverTarget",
  SxProps<Theme>
> = { intro, map, popupButton, hoverTarget };

export default styles;

import type { SxProps, Theme } from "@mui/material/styles";

const intro: SxProps<Theme> = { mb: 3, maxWidth: 760 };

const controls: SxProps<Theme> = { mb: 2 };

const map: SxProps<Theme> = { height: 420, borderRadius: 2 };

const alert: SxProps<Theme> = { mt: 2 };

const styles: Record<"intro" | "controls" | "map" | "alert", SxProps<Theme>> = {
  intro,
  controls,
  map,
  alert,
};

export default styles;

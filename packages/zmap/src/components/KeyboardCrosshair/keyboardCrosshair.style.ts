import type { SxProps, Theme } from "@mui/material/styles";

const root: SxProps<Theme> = (theme) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 3,
  pointerEvents: "none",
  color: theme.palette.primary.main,
});

const styles: { root: SxProps<Theme> } = { root };
export default styles;

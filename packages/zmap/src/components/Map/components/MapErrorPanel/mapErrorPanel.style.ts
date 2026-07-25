import type { SxProps, Theme } from "@mui/material/styles";

const root: SxProps<Theme> = (theme) => ({
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 1,
  p: 2,
  textAlign: "center",
  color: theme.palette.text.secondary,
  bgcolor: theme.palette.background.default,
});

const styles: { root: SxProps<Theme> } = { root };
export default styles;

import type { SxProps, Theme } from "@mui/material/styles";

const root: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  py: { xs: 6, md: 10 },
  gap: 2,
};

const lead: SxProps<Theme> = {
  maxWidth: 440,
};

const mapCard: SxProps<Theme> = (theme) => ({
  mt: 2,
  width: "100%",
  maxWidth: 480,
  borderRadius: 3,
  overflow: "hidden",
  boxShadow: theme.tokens.cardShadow,
});

const map: SxProps<Theme> = {
  height: 240,
};

const styles: Record<"root" | "lead" | "mapCard" | "map", SxProps<Theme>> = {
  root,
  lead,
  mapCard,
  map,
};

export default styles;

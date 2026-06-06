import type { SxProps, Theme } from "@mui/material/styles";

const root: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
};

const brand: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  flexGrow: 1,
};

const docsLink: SxProps<Theme> = {
  textTransform: "none",
  fontWeight: 600,
  mr: 0.5,
};

const main: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
};

const mapArea: SxProps<Theme> = {
  position: "relative",
  flex: 1,
  minWidth: 0,
  minHeight: { xs: "55vh", md: 0 },
};

const panel: SxProps<Theme> = (theme) => ({
  width: { xs: "100%", md: 380 },
  flexShrink: 0,
  overflowY: "auto",
  borderLeft: { md: `1px solid ${theme.palette.divider}` },
  borderTop: { xs: `1px solid ${theme.palette.divider}`, md: "none" },
  bgcolor: theme.palette.background.paper,
});

const styles: Record<
  "root" | "brand" | "docsLink" | "main" | "mapArea" | "panel",
  SxProps<Theme>
> = {
  root,
  brand,
  docsLink,
  main,
  mapArea,
  panel,
};

export default styles;

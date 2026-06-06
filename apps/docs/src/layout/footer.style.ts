import type { SxProps, Theme } from "@mui/material/styles";

const footer: SxProps<Theme> = {
  borderTop: 1,
  borderColor: "divider",
  mt: 6,
  py: { xs: 4, md: 6 },
  bgcolor: (t) =>
    t.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "grey.50",
};

const inner: SxProps<Theme> = {
  maxWidth: 1100,
  mx: "auto",
  px: { xs: 2, md: 4 },
};

const top: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 4,
  justifyContent: "space-between",
};

const brand: SxProps<Theme> = {
  flex: "1 1 280px",
  maxWidth: 380,
};

const brandRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  mb: 1.5,
};

const tagline: SxProps<Theme> = {
  mb: 1.5,
};

const columns: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: { xs: 4, sm: 6 },
};

const column: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  minWidth: 120,
};

const heading: SxProps<Theme> = {
  fontWeight: 700,
  mb: 0.5,
};

const link: SxProps<Theme> = {
  color: "text.secondary",
  textDecoration: "none",
  fontSize: "0.875rem",
  width: "fit-content",
  "&:hover": { color: "primary.main", textDecoration: "underline" },
};

const bottom: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  justifyContent: "space-between",
  alignItems: "center",
  mt: { xs: 4, md: 6 },
  pt: 3,
  borderTop: 1,
  borderColor: "divider",
};

// Annotate the default export — a bare inferred object trips TS2742 under
// `declaration: true` (the SxProps type isn't portably nameable).
const styles: Record<
  | "footer"
  | "inner"
  | "top"
  | "brand"
  | "brandRow"
  | "tagline"
  | "columns"
  | "column"
  | "heading"
  | "link"
  | "bottom",
  SxProps<Theme>
> = {
  footer,
  inner,
  top,
  brand,
  brandRow,
  tagline,
  columns,
  column,
  heading,
  link,
  bottom,
};

export default styles;

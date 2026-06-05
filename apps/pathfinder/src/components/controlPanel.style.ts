import type { SxProps, Theme } from "@mui/material/styles";

const root: SxProps<Theme> = {
  p: 3,
  display: "flex",
  flexDirection: "column",
  gap: 2.5,
};

const intro: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
};

const section: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

const sectionLabel: SxProps<Theme> = {
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  color: "text.secondary",
};

const toggleGroup: SxProps<Theme> = {
  "& .MuiToggleButton-root": {
    textTransform: "none",
    justifyContent: "flex-start",
    gap: 1,
    py: 1,
  },
};

const actions: SxProps<Theme> = {
  display: "flex",
  gap: 1,
};

const status: SxProps<Theme> = (theme) => ({
  p: 1.5,
  borderRadius: 1,
  bgcolor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[900]
      : theme.palette.grey[100],
  border: `1px solid ${theme.palette.divider}`,
});

const statsGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 1.5,
};

const stat: SxProps<Theme> = (theme) => ({
  p: 1.5,
  borderRadius: 1,
  border: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flexDirection: "column",
  gap: 0.25,
});

const statValue: SxProps<Theme> = {
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
};

const legendRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
};

// Dynamic style — the legend swatch takes a palette token or CSS color.
const swatch =
  (color: string): SxProps<Theme> =>
  () => ({
    width: 18,
    height: 18,
    borderRadius: "4px",
    flexShrink: 0,
    bgcolor: color,
  });

const swatchLine =
  (color: string): SxProps<Theme> =>
  () => ({
    width: 18,
    height: 4,
    borderRadius: 2,
    flexShrink: 0,
    bgcolor: color,
  });

const styles: {
  root: SxProps<Theme>;
  intro: SxProps<Theme>;
  section: SxProps<Theme>;
  sectionLabel: SxProps<Theme>;
  toggleGroup: SxProps<Theme>;
  actions: SxProps<Theme>;
  status: SxProps<Theme>;
  statsGrid: SxProps<Theme>;
  stat: SxProps<Theme>;
  statValue: SxProps<Theme>;
  legendRow: SxProps<Theme>;
  swatch: (color: string) => SxProps<Theme>;
  swatchLine: (color: string) => SxProps<Theme>;
} = {
  root,
  intro,
  section,
  sectionLabel,
  toggleGroup,
  actions,
  status,
  statsGrid,
  stat,
  statValue,
  legendRow,
  swatch,
  swatchLine,
};

export default styles;

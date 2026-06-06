import type { SxProps, Theme } from "@mui/material/styles";
import type { ControlPosition } from "./MapControls";

const OFFSETS: Record<ControlPosition, Record<string, number>> = {
  "top-left": { top: 8, left: 8 },
  "top-right": { top: 8, right: 8 },
  "bottom-left": { bottom: 8, left: 8 },
  "bottom-right": { bottom: 8, right: 8 },
};

const root = (position: ControlPosition): SxProps<Theme> => ({
  position: "absolute",
  zIndex: 2,
  ...OFFSETS[position],
});

const panel: SxProps<Theme> = {
  overflow: "hidden",
  maxWidth: 260,
};

const panelWidth = (width: number): SxProps<Theme> => ({
  width,
  maxWidth: width,
});

const header: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  pl: 1.5,
  pr: 0.5,
  py: 0.5,
};

const headerTitle: SxProps<Theme> = {
  fontWeight: 700,
  flexGrow: 1,
};

const list: SxProps<Theme> = {
  px: 1.5,
  pb: 1,
  pt: 0,
  maxHeight: 320,
  overflowY: "auto",
};

const groupHeading: SxProps<Theme> = {
  display: "block",
  mt: 1,
  mb: 0.25,
  color: "text.secondary",
  fontWeight: 700,
  letterSpacing: 0.4,
};

const row: SxProps<Theme> = {
  ml: 0,
  mr: 0,
  display: "flex",
};

const labelRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
};

const swatch = (color: string): SxProps<Theme> => ({
  width: 12,
  height: 12,
  borderRadius: "3px",
  bgcolor: color,
  flexShrink: 0,
  mr: 1,
  border: "1px solid",
  borderColor: "divider",
});

const icon: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  mr: 1,
  color: "text.secondary",
  "& svg": { fontSize: 18 },
};

const checkboxColor = (color: string): SxProps<Theme> => ({
  color,
  "&.Mui-checked": { color },
});

const styles: {
  root: (position: ControlPosition) => SxProps<Theme>;
  panel: SxProps<Theme>;
  panelWidth: (width: number) => SxProps<Theme>;
  header: SxProps<Theme>;
  headerTitle: SxProps<Theme>;
  list: SxProps<Theme>;
  groupHeading: SxProps<Theme>;
  row: SxProps<Theme>;
  labelRow: SxProps<Theme>;
  swatch: (color: string) => SxProps<Theme>;
  icon: SxProps<Theme>;
  checkboxColor: (color: string) => SxProps<Theme>;
} = {
  root,
  panel,
  panelWidth,
  header,
  headerTitle,
  list,
  groupHeading,
  row,
  labelRow,
  swatch,
  icon,
  checkboxColor,
};

export default styles;

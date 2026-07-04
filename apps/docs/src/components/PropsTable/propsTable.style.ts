import type { SxProps, Theme } from "@mui/material/styles";

const section: SxProps<Theme> = { mb: 6 };

const paper: SxProps<Theme> = (theme) => ({
  borderRadius: 3,
  overflow: "hidden",
  boxShadow: theme.tokens.cardShadow,
});

// Wide prop tables scroll inside the panel; the page never scrolls sideways.
const scroller: SxProps<Theme> = { overflowX: "auto" };

const table: SxProps<Theme> = {
  minWidth: 640,
  "& th": { fontWeight: 700, whiteSpace: "nowrap" },
  "& td": { verticalAlign: "top" },
};

const propName: SxProps<Theme> = {
  fontFamily: "monospace",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const required: SxProps<Theme> = {
  color: "error.main",
  ml: 0.25,
};

const propType: SxProps<Theme> = (theme) => ({
  fontFamily: "monospace",
  fontSize: "0.8rem",
  color: theme.palette.secondary.main,
  wordBreak: "break-word",
  maxWidth: 260,
  display: "inline-block",
});

const defaultValue: SxProps<Theme> = {
  fontFamily: "monospace",
  fontSize: "0.8rem",
  whiteSpace: "nowrap",
};

const description: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: "0.875rem",
  whiteSpace: "pre-line",
};

const styles: Record<
  | "section"
  | "paper"
  | "scroller"
  | "table"
  | "propName"
  | "required"
  | "propType"
  | "defaultValue"
  | "description",
  SxProps<Theme>
> = {
  section,
  paper,
  scroller,
  table,
  propName,
  required,
  propType,
  defaultValue,
  description,
};

export default styles;

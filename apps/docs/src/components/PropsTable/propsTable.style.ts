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

// Deprecated props sort last and read quietly struck-through.
// (propName's shape plus the strike — kept standalone so the component can
// ternary between the two without composing sx arrays.)
const deprecatedName: SxProps<Theme> = {
  fontFamily: "monospace",
  fontWeight: 600,
  whiteSpace: "nowrap",
  textDecoration: "line-through",
  textDecorationThickness: "1px",
  opacity: 0.6,
};

const deprecatedTag: SxProps<Theme> = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  color: "warning.main",
  ml: 0.75,
  whiteSpace: "nowrap",
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
  | "deprecatedName"
  | "deprecatedTag"
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
  deprecatedName,
  deprecatedTag,
  propType,
  defaultValue,
  description,
};

export default styles;

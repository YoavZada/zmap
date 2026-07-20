import type { SxProps, Theme } from "@mui/material/styles";

const section: SxProps<Theme> = { mb: 5 };

const paper: SxProps<Theme> = (theme) => ({
  borderRadius: 3,
  overflow: "hidden",
  boxShadow: theme.tokens.cardShadow,
});

const scroller: SxProps<Theme> = { overflowX: "auto" };

const table: SxProps<Theme> = {
  minWidth: 560,
  "& th": { fontWeight: 700, whiteSpace: "nowrap" },
  "& td": { verticalAlign: "top" },
};

const name: SxProps<Theme> = {
  fontFamily: "monospace",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const description: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: "0.875rem",
};

const typeChips: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  p: 2,
};

const styles: Record<
  | "section"
  | "paper"
  | "scroller"
  | "table"
  | "name"
  | "description"
  | "typeChips",
  SxProps<Theme>
> = { section, paper, scroller, table, name, description, typeChips };

export default styles;

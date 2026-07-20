import type { SxProps, Theme } from "@mui/material/styles";

// Plain-text anchor links to each block — quiet, no chips.
const jumpRow: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  columnGap: 2.5,
  rowGap: 1,
  mb: 5,
};

const jumpLink: SxProps<Theme> = {
  fontSize: 14,
  color: "text.secondary",
  "&:hover": { color: "primary.main" },
};

const styles: Record<"jumpRow" | "jumpLink", SxProps<Theme>> = {
  jumpRow,
  jumpLink,
};

export default styles;

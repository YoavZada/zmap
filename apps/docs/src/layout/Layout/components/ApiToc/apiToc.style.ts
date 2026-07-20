import type { SxProps, Theme } from "@mui/material/styles";

const root: SxProps<Theme> = { px: 1, pt: 1 };

const heading: SxProps<Theme> = { display: "block", px: 1.5, mb: 0.5 };

const list: SxProps<Theme> = { p: 0 };

// Mirrors the component nav's active treatment: 2px primary left rail + tint.
const item: SxProps<Theme> = (theme) => ({
  borderRadius: 2,
  mb: 0.25,
  pl: 1.5,
  py: 0.5,
  borderLeft: "2px solid transparent",
  color: "text.secondary",
  transition: theme.transitions.create(
    ["background-color", "color", "border-color"],
    { duration: 150 },
  ),
  "&:hover": { color: "text.primary" },
  "&.Mui-selected": {
    borderLeftColor: theme.palette.primary.main,
    bgcolor: theme.tokens.surfaceContainerHigh,
    color: "text.primary",
    "&:hover": { bgcolor: theme.tokens.surfaceContainerHigh },
  },
});

const styles: Record<"root" | "heading" | "list" | "item", SxProps<Theme>> = {
  root,
  heading,
  list,
  item,
};

export default styles;

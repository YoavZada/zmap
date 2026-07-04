import type { SxProps, Theme } from "@mui/material/styles";

// The dialog hangs near the top like a command palette, not centered.
const dialog: SxProps<Theme> = {
  "& .MuiDialog-container": { alignItems: "flex-start" },
  "& .MuiDialog-paper": {
    mt: 10,
    width: 560,
    maxWidth: "calc(100% - 32px)",
    borderRadius: 3,
  },
};

const input: SxProps<Theme> = { p: 2, pb: 1 };

const list: SxProps<Theme> = {
  maxHeight: 380,
  overflowY: "auto",
  pt: 0,
};

const category: SxProps<Theme> = {
  ml: "auto",
  flexShrink: 0,
  fontSize: "0.7rem",
};

const empty: SxProps<Theme> = { p: 3, textAlign: "center" };

const kbd: SxProps<Theme> = (theme) => ({
  px: 0.75,
  py: 0.1,
  ml: 1,
  borderRadius: 1,
  border: `1px solid ${theme.palette.divider}`,
  fontSize: "0.7rem",
  fontFamily: "monospace",
  color: "text.secondary",
  display: { xs: "none", md: "inline-block" },
});

const styles: Record<
  "dialog" | "input" | "list" | "category" | "empty" | "kbd",
  SxProps<Theme>
> = { dialog, input, list, category, empty, kbd };

export default styles;

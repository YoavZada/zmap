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

// Slim navbar trigger dressed as an input pill. Wide screens only — below lg
// the centered destination tabs need the room, so the icon trigger takes over.
const field: SxProps<Theme> = (theme) => ({
  display: { xs: "none", lg: "flex" },
  alignItems: "center",
  gap: 1,
  height: 36,
  width: { lg: 220 },
  pl: 1.25,
  pr: 0.75,
  borderRadius: 2,
  border: "1px solid",
  borderColor:
    theme.palette.mode === "dark"
      ? "rgba(148,163,184,0.18)"
      : "rgba(15,23,42,0.12)",
  color: "text.secondary",
  bgcolor:
    theme.palette.mode === "dark"
      ? "rgba(148,163,184,0.08)"
      : "rgba(255,255,255,0.9)",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 1px 2px rgba(0,0,0,0.35)"
      : "0 1px 2px rgba(15,23,42,0.08)",
  justifyContent: "flex-start",
  transition: theme.transitions.create(
    ["border-color", "background-color", "box-shadow"],
    { duration: 150 },
  ),
  "&:hover": {
    borderColor: theme.palette.primary.main,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 2px 8px rgba(0,0,0,0.45)"
        : "0 2px 8px rgba(15,23,42,0.12)",
  },
});

const fieldIcon: SxProps<Theme> = { fontSize: 18, color: "text.primary" };

const fieldText: SxProps<Theme> = {
  flexGrow: 1,
  textAlign: "left",
  fontSize: 14,
};

// The ⌘K glyph — borderless and unfilled so it blends into the field. The K is
// slightly larger and spaced from the ⌘ so both read crisply.
const fieldKbd: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.5,
  minWidth: 24,
  height: 20,
  px: 0.6,
  fontWeight: 700,
  lineHeight: 1,
  color: "text.primary",
};

const fieldKbdCmd: SxProps<Theme> = { fontSize: "0.75rem" };

const fieldKbdKey: SxProps<Theme> = {
  fontSize: "0.875rem",
  letterSpacing: "0.02em",
};

// The icon fallback shown only when the field is hidden (below lg).
const iconOnMobile: SxProps<Theme> = {
  display: { xs: "inline-flex", lg: "none" },
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
  | "field"
  | "fieldIcon"
  | "fieldText"
  | "fieldKbd"
  | "fieldKbdCmd"
  | "fieldKbdKey"
  | "iconOnMobile"
  | "dialog"
  | "input"
  | "list"
  | "category"
  | "empty"
  | "kbd",
  SxProps<Theme>
> = {
  field,
  fieldIcon,
  fieldText,
  fieldKbd,
  fieldKbdCmd,
  fieldKbdKey,
  iconOnMobile,
  dialog,
  input,
  list,
  category,
  empty,
  kbd,
};

export default styles;

import type { SxProps, Theme } from "@mui/material/styles";
import { MONO } from "../../theme";

const section: SxProps<Theme> = {
  mb: 8,
};

const description: SxProps<Theme> = {
  mb: 1,
  maxWidth: 720,
};

// A quiet mono line naming the composed parts — plain text, no chips.
const componentList: SxProps<Theme> = {
  fontFamily: MONO,
  fontSize: 13,
  color: "text.secondary",
  mb: 2,
};

// The title doubles as its own anchor link; the "#" affordance shows on hover.
const titleLink: SxProps<Theme> = {
  color: "inherit",
  textDecoration: "none",
  "&:hover .anchor-hash": { opacity: 1 },
  "& .anchor-hash": {
    opacity: 0,
    transition: "opacity 120ms",
    color: "text.disabled",
    ml: 1,
  },
};

const panel: SxProps<Theme> = (theme) => ({
  overflow: "hidden",
  borderRadius: 3,
  boxShadow: theme.tokens.cardShadow,
  transition: theme.transitions.create(["box-shadow", "border-color"], {
    duration: 200,
  }),
  "&:hover": {
    borderColor:
      theme.palette.mode === "dark"
        ? "rgba(148,163,184,0.35)"
        : "rgba(19,27,46,0.22)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0px 8px 24px -6px rgba(0,0,0,0.5)"
        : "0px 8px 24px -6px rgba(19,27,46,0.14)",
  },
});

// The tab bar also carries the copy-source button, right-aligned.
const tabBar: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  borderBottom: 1,
  borderColor: "divider",
  px: 1,
  minHeight: 44,
  bgcolor: theme.tokens.surfaceContainerLow,
});

const tabs: SxProps<Theme> = {
  minHeight: 44,
  flexGrow: 1,
};

const tab: SxProps<Theme> = {
  minHeight: 44,
  textTransform: "none",
};

const copyButton: SxProps<Theme> = {
  color: "text.secondary",
  mr: 0.5,
};

const preview: SxProps<Theme> = (theme) => ({
  p: { xs: 0, sm: 2 },
  background: theme.tokens.previewGradient,
});

// Long block sources scroll inside the panel.
const codeArea: SxProps<Theme> = {
  p: 2,
  maxHeight: 560,
  overflow: "auto",
};

const placeholder = (height: number): SxProps<Theme> => ({
  height,
  width: "100%",
  borderRadius: 2,
});

const styles: {
  section: SxProps<Theme>;
  description: SxProps<Theme>;
  componentList: SxProps<Theme>;
  titleLink: SxProps<Theme>;
  panel: SxProps<Theme>;
  tabBar: SxProps<Theme>;
  tabs: SxProps<Theme>;
  tab: SxProps<Theme>;
  copyButton: SxProps<Theme>;
  preview: SxProps<Theme>;
  codeArea: SxProps<Theme>;
  placeholder: (height: number) => SxProps<Theme>;
} = {
  section,
  description,
  componentList,
  titleLink,
  panel,
  tabBar,
  tabs,
  tab,
  copyButton,
  preview,
  codeArea,
  placeholder,
};

export default styles;

import type { SxProps, Theme } from "@mui/material/styles";

export const DRAWER_WIDTH = 264;

const root: SxProps<Theme> = {
  display: "flex",
  minHeight: "100vh",
};

// Frosted-glass bar: saturated blur + a hairline that reads as etched, not drawn.
const appBar: SxProps<Theme> = (theme) => ({
  zIndex: theme.zIndex.drawer + 1,
  borderBottom: "1px solid",
  borderColor:
    theme.palette.mode === "dark"
      ? "rgba(148,163,184,0.14)"
      : "rgba(19,27,46,0.08)",
  backdropFilter: "saturate(180%) blur(14px)",
  bgcolor:
    theme.palette.mode === "dark"
      ? "rgba(11,17,32,0.72)"
      : "rgba(246,248,251,0.72)",
});

const menuButton: SxProps<Theme> = {
  mr: 1,
  display: { sm: "none" },
};

const logo: SxProps<Theme> = {
  mr: 1,
};

// Wordmark: quiet gradient from text into the primary accent.
const title: SxProps<Theme> = (theme) => ({
  letterSpacing: "-0.03em",
  background: `linear-gradient(90deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 130%)`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
});

const spacer: SxProps<Theme> = {
  flexGrow: 1,
};

const demoLink: SxProps<Theme> = {
  textTransform: "none",
  fontWeight: 600,
  mr: 0.5,
  display: { xs: "none", sm: "inline-flex" },
};

const desktopDrawer: SxProps<Theme> = (theme) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  display: { xs: "none", sm: "block" },
  "& .MuiDrawer-paper": {
    width: DRAWER_WIDTH,
    boxSizing: "border-box",
    borderRight: 1,
    borderColor: "divider",
    bgcolor: theme.tokens.surfaceContainerLow,
  },
});

const mobileDrawer: SxProps<Theme> = {
  display: { xs: "block", sm: "none" },
  "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
};

// Drawer interior is a flex column so the CTA can pin to the bottom.
const drawerBody: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
};

const eyebrow: SxProps<Theme> = {
  px: 2.5,
  pt: 2,
  pb: 1.5,
};

const version: SxProps<Theme> = {
  color: "text.secondary",
  fontFamily: "monospace",
  fontSize: 12,
  "&:hover": { color: "text.primary" },
};

const main: SxProps<Theme> = {
  flexGrow: 1,
  width: 0,
};

const content: SxProps<Theme> = {
  p: { xs: 2, md: 4 },
  maxWidth: 1100,
  mx: "auto",
};

const navList: SxProps<Theme> = {
  px: 1,
  flexGrow: 1,
  overflowY: "auto",
};

// Active item: 2px primary left rail + subtle tint (design's nav spec).
// Motion is quick and quiet — background/indent ease rather than snap.
const navItem: SxProps<Theme> = (theme) => ({
  borderRadius: 2,
  mb: 0.5,
  pl: 1.5,
  borderLeft: "2px solid transparent",
  color: "text.secondary",
  transition: theme.transitions.create(
    ["background-color", "color", "border-color", "padding-left"],
    { duration: 150 },
  ),
  "& .MuiListItemIcon-root": { minWidth: 34, color: "inherit" },
  "&:hover": {
    color: "text.primary",
    pl: 1.75,
  },
  "&.Mui-selected": {
    borderLeftColor: theme.palette.primary.main,
    bgcolor: theme.tokens.surfaceContainerHigh,
    color: "text.primary",
    "&:hover": { bgcolor: theme.tokens.surfaceContainerHigh, pl: 1.5 },
  },
});

const ctaWrap: SxProps<Theme> = {
  p: 2,
  borderTop: 1,
  borderColor: "divider",
};

const cta: SxProps<Theme> = {
  width: "100%",
};

const styles: {
  root: SxProps<Theme>;
  appBar: SxProps<Theme>;
  menuButton: SxProps<Theme>;
  logo: SxProps<Theme>;
  title: SxProps<Theme>;
  spacer: SxProps<Theme>;
  demoLink: SxProps<Theme>;
  desktopDrawer: SxProps<Theme>;
  mobileDrawer: SxProps<Theme>;
  drawerBody: SxProps<Theme>;
  eyebrow: SxProps<Theme>;
  version: SxProps<Theme>;
  main: SxProps<Theme>;
  content: SxProps<Theme>;
  navList: SxProps<Theme>;
  navItem: SxProps<Theme>;
  ctaWrap: SxProps<Theme>;
  cta: SxProps<Theme>;
} = {
  root,
  appBar,
  menuButton,
  logo,
  title,
  spacer,
  demoLink,
  desktopDrawer,
  mobileDrawer,
  drawerBody,
  eyebrow,
  version,
  main,
  content,
  navList,
  navItem,
  ctaWrap,
  cta,
};

export default styles;

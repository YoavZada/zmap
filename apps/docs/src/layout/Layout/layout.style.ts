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
  display: { md: "none" },
};

// Brand cluster: bolt glyph + gradient wordmark + quiet version tag, anchoring
// the bar's left edge.
const brandGroup: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

const brand: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  textDecoration: "none",
  color: "inherit",
};

// Wordmark: quiet gradient from text into the primary accent.
const title: SxProps<Theme> = (theme) => ({
  letterSpacing: "-0.03em",
  background: `linear-gradient(90deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 130%)`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
});

// Version: low-contrast mono text beside the wordmark, links to release notes.
// Hidden on phones so the centered cluster clears the right-side icons.
const version: SxProps<Theme> = {
  display: { xs: "none", sm: "inline-block" },
  color: "text.secondary",
  fontFamily: "monospace",
  fontSize: 12,
  "&:hover": { color: "text.primary" },
};

// Destination tabs — pinned to the true center of the bar regardless of how
// wide the side clusters are; active reads as primary with a soft tint.
const navTabs: SxProps<Theme> = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  display: { xs: "none", md: "flex" },
  alignItems: "center",
  gap: 0.5,
};

const navTab = (active: boolean): SxProps<Theme> => ({
  px: 1.5,
  minWidth: 0,
  fontWeight: active ? 700 : 500,
  color: active ? "text.primary" : "text.secondary",
  bgcolor: active ? "action.selected" : "transparent",
  "&:hover": { color: "text.primary", bgcolor: "action.hover" },
});

const spacer: SxProps<Theme> = {
  flexGrow: 1,
};

// The row of navbar utilities to the right of search.
const actions: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  ml: 1,
};

// npm lives in the footer too — drop it on phones to clear the centered brand.
const npmAction: SxProps<Theme> = {
  display: { xs: "none", sm: "inline-flex" },
};

const desktopDrawer: SxProps<Theme> = (theme) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  display: { xs: "none", md: "block" },
  "& .MuiDrawer-paper": {
    width: DRAWER_WIDTH,
    boxSizing: "border-box",
    borderRight: 1,
    borderColor: "divider",
    bgcolor: theme.tokens.surfaceContainerLow,
  },
});

const mobileDrawer: SxProps<Theme> = {
  display: { xs: "block", md: "none" },
  "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
};

// Drawer interior is a flex column.
const drawerBody: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflowY: "auto",
  py: 1.5,
};

const navList: SxProps<Theme> = {
  px: 1,
  py: 0,
};

// A group's overline header inside the component rail.
const groupHeader: SxProps<Theme> = {
  display: "block",
  px: 2,
  pt: 2,
  pb: 0.5,
};

// Active item: 2px primary left rail + subtle tint (design's nav spec).
// Motion is quick and quiet — background/indent ease rather than snap.
const navItem: SxProps<Theme> = (theme) => ({
  borderRadius: 2,
  mb: 0.25,
  pl: 1.5,
  py: 0.5,
  borderLeft: "2px solid transparent",
  color: "text.secondary",
  transition: theme.transitions.create(
    ["background-color", "color", "border-color", "padding-left"],
    { duration: 150 },
  ),
  "& .MuiListItemIcon-root": { minWidth: 32, color: "inherit" },
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

// Divider between the mobile drawer's destinations block and the groups.
const mobileDivider: SxProps<Theme> = { my: 1, mx: 2 };

const main: SxProps<Theme> = {
  flexGrow: 1,
  width: 0,
};

// Doc pages: a comfortable centered reading column.
const content: SxProps<Theme> = {
  p: { xs: 2, md: 4 },
  maxWidth: 1100,
  mx: "auto",
};

// Landing: full-bleed — IntroPage manages its own section widths/padding.
const contentFull: SxProps<Theme> = {
  width: "100%",
};

const styles: {
  root: SxProps<Theme>;
  appBar: SxProps<Theme>;
  menuButton: SxProps<Theme>;
  brandGroup: SxProps<Theme>;
  brand: SxProps<Theme>;
  title: SxProps<Theme>;
  version: SxProps<Theme>;
  navTabs: SxProps<Theme>;
  navTab: (active: boolean) => SxProps<Theme>;
  spacer: SxProps<Theme>;
  actions: SxProps<Theme>;
  npmAction: SxProps<Theme>;
  desktopDrawer: SxProps<Theme>;
  mobileDrawer: SxProps<Theme>;
  drawerBody: SxProps<Theme>;
  navList: SxProps<Theme>;
  groupHeader: SxProps<Theme>;
  navItem: SxProps<Theme>;
  mobileDivider: SxProps<Theme>;
  main: SxProps<Theme>;
  content: SxProps<Theme>;
  contentFull: SxProps<Theme>;
} = {
  root,
  appBar,
  menuButton,
  brandGroup,
  brand,
  title,
  version,
  navTabs,
  navTab,
  spacer,
  actions,
  npmAction,
  desktopDrawer,
  mobileDrawer,
  drawerBody,
  navList,
  groupHeader,
  navItem,
  mobileDivider,
  main,
  content,
  contentFull,
};

export default styles;

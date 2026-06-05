import type { SxProps, Theme } from "@mui/material/styles";

export const DRAWER_WIDTH = 248;

const root: SxProps<Theme> = {
  display: "flex",
  minHeight: "100vh",
};

const appBar: SxProps<Theme> = {
  zIndex: (t) => t.zIndex.drawer + 1,
  borderBottom: 1,
  borderColor: "divider",
  backdropFilter: "blur(8px)",
  bgcolor: (t) =>
    t.palette.mode === "dark" ? "rgba(18,18,18,0.8)" : "rgba(255,255,255,0.8)",
};

const menuButton: SxProps<Theme> = {
  mr: 1,
  display: { sm: "none" },
};

const logo: SxProps<Theme> = {
  mr: 1,
};

const title: SxProps<Theme> = {
  letterSpacing: -0.5,
};

const chip: SxProps<Theme> = {
  ml: 1.5,
  display: { xs: "none", sm: "flex" },
};

const spacer: SxProps<Theme> = {
  flexGrow: 1,
};

const desktopDrawer: SxProps<Theme> = {
  width: DRAWER_WIDTH,
  flexShrink: 0,
  display: { xs: "none", sm: "block" },
  "& .MuiDrawer-paper": {
    width: DRAWER_WIDTH,
    boxSizing: "border-box",
    borderRight: 1,
    borderColor: "divider",
  },
};

const mobileDrawer: SxProps<Theme> = {
  display: { xs: "block", sm: "none" },
  "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
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
};

const navItem: SxProps<Theme> = {
  borderRadius: 2,
  mb: 0.5,
};

// Annotate the default export — a bare inferred object trips TS2742 under
// `declaration: true` (the SxProps type isn't portably nameable).
const styles: Record<
  | "root"
  | "appBar"
  | "menuButton"
  | "logo"
  | "title"
  | "chip"
  | "spacer"
  | "desktopDrawer"
  | "mobileDrawer"
  | "main"
  | "content"
  | "navList"
  | "navItem",
  SxProps<Theme>
> = {
  root,
  appBar,
  menuButton,
  logo,
  title,
  chip,
  spacer,
  desktopDrawer,
  mobileDrawer,
  main,
  content,
  navList,
  navItem,
};

export default styles;

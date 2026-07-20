import type { SxProps, Theme } from "@mui/material/styles";

/* The landing renders on the Layout's full-bleed variant, so this page owns
 * its own section widths: a wide hero band, then centered content columns. */

// Full-bleed hero band: faint dot-grid plus one soft primary glow, both fading
// out before the fold — texture, not decoration.
const heroBleed: SxProps<Theme> = (theme) => ({
  position: "relative",
  overflow: "hidden",
  borderBottom: 1,
  borderColor: "divider",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    backgroundImage: `radial-gradient(${
      theme.palette.mode === "dark"
        ? "rgba(148,163,184,0.14)"
        : "rgba(15,23,42,0.10)"
    } 1px, transparent 1px)`,
    backgroundSize: "22px 22px",
    maskImage: "radial-gradient(ellipse 90% 80% at 50% 0%, black, transparent)",
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: -240,
    left: "8%",
    width: 560,
    height: 560,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${
      theme.palette.mode === "dark"
        ? "rgba(129,140,248,0.14)"
        : "rgba(79,70,229,0.10)"
    } 0%, transparent 70%)`,
    pointerEvents: "none",
  },
});

const heroInner: SxProps<Theme> = {
  position: "relative",
  zIndex: 1,
  maxWidth: 1200,
  mx: "auto",
  px: { xs: 2, md: 4 },
  py: { xs: 6, md: 10 },
};

// Gradient ink on the headline's key phrase — primary flowing into secondary.
const accent: SxProps<Theme> = (theme) => ({
  background: `linear-gradient(92deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
});

const heroLead: SxProps<Theme> = { mb: 3, maxWidth: 520 };

const heroActions: SxProps<Theme> = { mb: 3 };

const installButton: SxProps<Theme> = (theme) => ({
  bgcolor: theme.tokens.inverseSurface,
  color: theme.tokens.inverseOnSurface,
  fontFamily: "monospace",
  fontSize: 13,
  px: 2,
  "&:hover": { bgcolor: theme.tokens.inverseSurface, opacity: 0.92 },
});

const checkIcon: SxProps<Theme> = { fontSize: 18, color: "primary.main" };

const showcase: SxProps<Theme> = (theme) => ({
  display: "flex",
  height: { xs: 280, md: 380 },
  borderRadius: 3,
  overflow: "hidden",
  boxShadow: theme.tokens.cardShadow,
  "& > :first-of-type": { borderRight: 1, borderColor: "divider" },
});

const showcaseHalf: SxProps<Theme> = {
  position: "relative",
  flex: 1,
  minWidth: 0,
};

const showcaseMap: SxProps<Theme> = { height: "100%" };

// Plain corner text over the map — frosted for legibility, no chip.
const showcaseLabel: SxProps<Theme> = (theme) => ({
  position: "absolute",
  bottom: 10,
  left: 12,
  px: 1,
  py: 0.25,
  borderRadius: 1,
  fontSize: 12,
  fontWeight: 600,
  color: "text.primary",
  backdropFilter: "blur(6px)",
  bgcolor:
    theme.palette.mode === "dark"
      ? "rgba(11,17,32,0.55)"
      : "rgba(246,248,251,0.65)",
});

// Centered content column for everything below the hero.
const section: SxProps<Theme> = {
  maxWidth: 1100,
  mx: "auto",
  px: { xs: 2, md: 4 },
  pt: { xs: 6, md: 8 },
};

const featureLead: SxProps<Theme> = { mb: 4 };

// Bento: cards share one surface language; the grid sizing (in the component)
// gives them uneven spans so the section reads composed, not templated.
const featureCard: SxProps<Theme> = (theme) => ({
  p: 3,
  height: "100%",
  borderRadius: 3,
  transition: "box-shadow .2s, border-color .2s",
  "&:hover": {
    boxShadow: theme.tokens.cardShadow,
    borderColor: "primary.main",
  },
});

const featureIcon: SxProps<Theme> = (theme) => ({
  width: 44,
  height: 44,
  borderRadius: 2,
  display: "grid",
  placeItems: "center",
  color: "primary.main",
  bgcolor: theme.tokens.surfaceContainerHigh,
  mb: 2,
});

// Pathfinder showcase tile — the demo's home now that it left the navbar.
const pathfinderTile: SxProps<Theme> = (theme) => ({
  p: { xs: 3, md: 4 },
  borderRadius: 3,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 3,
  background: theme.tokens.previewGradient,
  transition: "box-shadow .2s, border-color .2s",
  "&:hover": {
    boxShadow: theme.tokens.cardShadow,
    borderColor: "primary.main",
  },
});

const pathfinderText: SxProps<Theme> = { flex: "1 1 360px" };

const pathfinderIcon: SxProps<Theme> = (theme) => ({
  width: 56,
  height: 56,
  borderRadius: 2.5,
  display: "grid",
  placeItems: "center",
  color: "primary.main",
  bgcolor: theme.tokens.surfaceContainerHigh,
});

const sectionLead: SxProps<Theme> = { mb: 2.5, maxWidth: 720 };

const quickStart: SxProps<Theme> = {
  maxWidth: 1100,
  mx: "auto",
  px: { xs: 2, md: 4 },
  pt: { xs: 6, md: 8 },
  scrollMarginTop: 88,
};

const styles: Record<
  | "heroBleed"
  | "heroInner"
  | "accent"
  | "heroLead"
  | "heroActions"
  | "installButton"
  | "checkIcon"
  | "showcase"
  | "showcaseHalf"
  | "showcaseMap"
  | "showcaseLabel"
  | "section"
  | "featureLead"
  | "featureCard"
  | "featureIcon"
  | "pathfinderTile"
  | "pathfinderText"
  | "pathfinderIcon"
  | "sectionLead"
  | "quickStart",
  SxProps<Theme>
> = {
  heroBleed,
  heroInner,
  accent,
  heroLead,
  heroActions,
  installButton,
  checkIcon,
  showcase,
  showcaseHalf,
  showcaseMap,
  showcaseLabel,
  section,
  featureLead,
  featureCard,
  featureIcon,
  pathfinderTile,
  pathfinderText,
  pathfinderIcon,
  sectionLead,
  quickStart,
};

export default styles;

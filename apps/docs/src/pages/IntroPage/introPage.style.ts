import type { SxProps, Theme } from "@mui/material/styles";

const hero: SxProps<Theme> = { mb: 10 };

const accent: SxProps<Theme> = { color: "primary.main" };

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

const showcaseChip: SxProps<Theme> = {
  position: "absolute",
  bottom: 10,
  left: 10,
  bgcolor: "background.paper",
  fontWeight: 600,
};

const featureSection: SxProps<Theme> = { mb: 10 };

const featureLead: SxProps<Theme> = { mb: 4 };

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

const installSection: SxProps<Theme> = { mb: 6 };

const sectionLead: SxProps<Theme> = { mb: 2.5, maxWidth: 720 };

const quickStart: SxProps<Theme> = { scrollMarginTop: 88 };

const styles: Record<
  | "hero"
  | "accent"
  | "heroLead"
  | "heroActions"
  | "installButton"
  | "checkIcon"
  | "showcase"
  | "showcaseHalf"
  | "showcaseMap"
  | "showcaseChip"
  | "featureSection"
  | "featureLead"
  | "featureCard"
  | "featureIcon"
  | "installSection"
  | "sectionLead"
  | "quickStart",
  SxProps<Theme>
> = {
  hero,
  accent,
  heroLead,
  heroActions,
  installButton,
  checkIcon,
  showcase,
  showcaseHalf,
  showcaseMap,
  showcaseChip,
  featureSection,
  featureLead,
  featureCard,
  featureIcon,
  installSection,
  sectionLead,
  quickStart,
};

export default styles;

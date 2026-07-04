import type { SxProps, Theme } from "@mui/material/styles";

const section: SxProps<Theme> = {
  mb: 6,
};

const description: SxProps<Theme> = {
  mb: 2,
  maxWidth: 720,
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
});

const tabs: SxProps<Theme> = (theme) => ({
  borderBottom: 1,
  borderColor: "divider",
  px: 1,
  minHeight: 44,
  bgcolor: theme.tokens.surfaceContainerLow,
});

const tab: SxProps<Theme> = {
  minHeight: 44,
  textTransform: "none",
};

// Subtle primary→secondary wash behind map previews adds depth (design spec).
const preview: SxProps<Theme> = (theme) => ({
  p: { xs: 0, sm: 2 },
  background: theme.tokens.previewGradient,
});

const codeArea: SxProps<Theme> = {
  p: 2,
};

// Reserves the preview's height before its map is lazily mounted, so revealing
// the real demo doesn't shift the page. Matches the map's rounded corners.
const placeholder = (height: number): SxProps<Theme> => ({
  height,
  width: "100%",
  borderRadius: 2,
});

const styles: {
  section: SxProps<Theme>;
  description: SxProps<Theme>;
  titleLink: SxProps<Theme>;
  panel: SxProps<Theme>;
  tabs: SxProps<Theme>;
  tab: SxProps<Theme>;
  preview: SxProps<Theme>;
  codeArea: SxProps<Theme>;
  placeholder: (height: number) => SxProps<Theme>;
} = {
  section,
  description,
  titleLink,
  panel,
  tabs,
  tab,
  preview,
  codeArea,
  placeholder,
};

export default styles;

import type { SxProps, Theme } from "@mui/material/styles";

const section: SxProps<Theme> = {
  mb: 6,
};

const description: SxProps<Theme> = {
  mb: 2,
  maxWidth: 720,
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

const styles: Record<
  "section" | "description" | "panel" | "tabs" | "tab" | "preview" | "codeArea",
  SxProps<Theme>
> = { section, description, panel, tabs, tab, preview, codeArea };

export default styles;

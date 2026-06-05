import type { SxProps, Theme } from "@mui/material/styles";

const section: SxProps<Theme> = {
  mb: 6,
};

const description: SxProps<Theme> = {
  mb: 2,
  maxWidth: 720,
};

const panel: SxProps<Theme> = {
  overflow: "hidden",
  borderRadius: 3,
};

const tabs: SxProps<Theme> = {
  borderBottom: 1,
  borderColor: "divider",
  px: 1,
  minHeight: 44,
};

const tab: SxProps<Theme> = {
  minHeight: 44,
};

const preview: SxProps<Theme> = {
  p: { xs: 0, sm: 2 },
};

const codeArea: SxProps<Theme> = {
  p: 2,
};

// Annotate the default export — a bare inferred object trips TS2742 under
// `declaration: true` (the SxProps type isn't portably nameable).
const styles: Record<
  "section" | "description" | "panel" | "tabs" | "tab" | "preview" | "codeArea",
  SxProps<Theme>
> = { section, description, panel, tabs, tab, preview, codeArea };

export default styles;

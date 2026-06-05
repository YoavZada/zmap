import type { CSSProperties } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

const container: SxProps<Theme> = {
  position: "relative",
};

const copyButton: SxProps<Theme> = {
  position: "absolute",
  top: 8,
  right: 8,
  zIndex: 1,
  color: "grey.400",
};

// `prismStyle` is the theme-colored CSSProperties from prism's render prop —
// a dynamic value passed in; the shape of the rest of the style lives here.
const pre = (prismStyle: CSSProperties): SxProps<Theme> => ({
  ...prismStyle,
  m: 0,
  p: 2,
  borderRadius: 2,
  fontSize: 13,
  lineHeight: 1.6,
  overflow: "auto",
  border: 1,
  borderColor: "divider",
});

// Annotate the default export — a bare inferred object trips TS2742 under
// `declaration: true` (the SxProps type isn't portably nameable).
const styles: {
  container: SxProps<Theme>;
  copyButton: SxProps<Theme>;
  pre: (prismStyle: CSSProperties) => SxProps<Theme>;
} = { container, copyButton, pre };

export default styles;

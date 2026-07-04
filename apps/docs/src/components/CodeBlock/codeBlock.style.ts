import type { CSSProperties } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import { MONO } from "../../theme";

// --- Plain variant (used inside DemoSection's Code tab) ---------------------
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
// the dynamic value passed in; the rest of the shape lives here.
const preBase = (prismStyle: CSSProperties): CSSProperties & object => ({
  ...prismStyle,
  margin: 0,
  fontFamily: MONO,
  fontSize: 14,
  lineHeight: "24px",
  overflow: "auto",
});

const pre =
  (prismStyle: CSSProperties): SxProps<Theme> =>
  (theme) => ({
    ...preBase(prismStyle),
    background: theme.tokens.codeBg,
    p: 2,
    borderRadius: 2,
    border: 1,
    borderColor: "divider",
  });

// --- Windowed variant (the centerpiece "Demo & Preview Card") ---------------
const windowBox: SxProps<Theme> = {
  borderRadius: 3,
  overflow: "hidden",
  border: 1,
  borderColor: "divider",
};

const header: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  px: 1.75,
  py: 1,
  bgcolor: theme.tokens.surfaceContainerLow,
  borderBottom: 1,
  borderColor: "divider",
});

const dots: SxProps<Theme> = {
  display: "flex",
  gap: 0.75,
};

const dot = (color: string): SxProps<Theme> => ({
  width: 12,
  height: 12,
  borderRadius: "50%",
  bgcolor: color,
});

const filename: SxProps<Theme> = {
  fontFamily: MONO,
  fontSize: 13,
  color: "text.secondary",
  ml: 0.5,
};

const headerSpacer: SxProps<Theme> = { flexGrow: 1 };

const copyInline: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 13,
  textTransform: "none",
};

const preFlush =
  (prismStyle: CSSProperties): SxProps<Theme> =>
  (theme) => ({
    ...preBase(prismStyle),
    background: theme.tokens.codeBg,
    p: 2,
    borderRadius: 0,
  });

const note: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 1,
  px: 1.75,
  py: 1.25,
  bgcolor: theme.tokens.surfaceContainerLow,
  borderTop: 1,
  borderColor: "divider",
  color: "text.secondary",
  fontSize: 13,
});

const styles: {
  container: SxProps<Theme>;
  copyButton: SxProps<Theme>;
  pre: (prismStyle: CSSProperties) => SxProps<Theme>;
  windowBox: SxProps<Theme>;
  header: SxProps<Theme>;
  dots: SxProps<Theme>;
  dot: (color: string) => SxProps<Theme>;
  filename: SxProps<Theme>;
  headerSpacer: SxProps<Theme>;
  copyInline: SxProps<Theme>;
  preFlush: (prismStyle: CSSProperties) => SxProps<Theme>;
  note: SxProps<Theme>;
} = {
  container,
  copyButton,
  pre,
  windowBox,
  header,
  dots,
  dot,
  filename,
  headerSpacer,
  copyInline,
  preFlush,
  note,
};

export default styles;

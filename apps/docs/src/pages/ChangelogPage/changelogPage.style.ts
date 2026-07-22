import type { SxProps, Theme } from "@mui/material/styles";

// Markdown body — the raw CHANGELOG.md rendered through react-markdown,
// styled to read like the rest of the docs typography.
const content: SxProps<Theme> = (theme) => ({
  maxWidth: 760,
  "& h2": {
    ...theme.typography.h5,
    fontWeight: 700,
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(1.5),
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  "& h3": {
    ...theme.typography.h6,
    fontWeight: 600,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
  },
  "& p, & li": {
    ...theme.typography.body1,
    color: theme.palette.text.secondary,
    lineHeight: 1.7,
  },
  "& li": { marginBottom: theme.spacing(0.5) },
  "& a": {
    color: theme.palette.primary.main,
    textDecorationColor: "inherit",
  },
  "& code": {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.85em",
    padding: theme.spacing(0.2, 0.6),
    borderRadius: 1,
    backgroundColor: theme.palette.action.hover,
  },
  "& strong": { color: theme.palette.text.primary },
});

const styles: { content: SxProps<Theme> } = { content };

export default styles;

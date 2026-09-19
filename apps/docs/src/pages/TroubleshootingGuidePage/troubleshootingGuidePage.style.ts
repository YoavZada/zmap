import type { SxProps, Theme } from "@mui/material/styles";

const section: SxProps<Theme> = { mb: 6, maxWidth: 860 };

const sectionLead: SxProps<Theme> = { mb: 2.5, lineHeight: 1.7 };

// Caption trailing a filename-less CodeBlock: CodeBlock only renders its
// `note` prop in the windowed (filename) variant, so a plain snippet's
// footnote has to be a regular paragraph instead.
const trailingNote: SxProps<Theme> = { mt: 1.5, lineHeight: 1.7 };

const table: SxProps<Theme> = (theme) => ({
  mb: 2.5,
  "& th": {
    ...theme.typography.subtitle2,
    borderBottom: `2px solid ${theme.palette.divider}`,
    textAlign: "left",
    padding: theme.spacing(1, 2),
  },
  "& td": {
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 2),
    verticalAlign: "top",
  },
  "& code": {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.85em",
  },
});

const styles: {
  section: SxProps<Theme>;
  sectionLead: SxProps<Theme>;
  trailingNote: SxProps<Theme>;
  table: SxProps<Theme>;
} = { section, sectionLead, trailingNote, table };

export default styles;

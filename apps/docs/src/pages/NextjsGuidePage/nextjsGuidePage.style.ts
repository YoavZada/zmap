import type { SxProps, Theme } from "@mui/material/styles";

const section: SxProps<Theme> = { mb: 6, maxWidth: 860 };

const sectionLead: SxProps<Theme> = { mb: 2.5, lineHeight: 1.7 };

// Caption trailing a filename-less CodeBlock: CodeBlock only renders its
// `note` prop in the windowed (filename) variant, so a plain snippet's
// footnote has to be a regular paragraph instead.
const trailingNote: SxProps<Theme> = { mt: 1.5, lineHeight: 1.7 };

const styles: {
  section: SxProps<Theme>;
  sectionLead: SxProps<Theme>;
  trailingNote: SxProps<Theme>;
} = { section, sectionLead, trailingNote };

export default styles;

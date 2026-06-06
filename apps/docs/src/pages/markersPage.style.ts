import type { SxProps, Theme } from "@mui/material/styles";

const intro: SxProps<Theme> = { mb: 3, maxWidth: 760 };

// Map height varies per demo, so the shape lives here and the height is passed in.
const map = (height: number): SxProps<Theme> => ({ height, borderRadius: 2 });

const avatar: SxProps<Theme> = {
  bgcolor: "secondary.main",
  border: "2px solid white",
  width: 44,
  height: 44,
  fontSize: 14,
};

const controls: SxProps<Theme> = { mb: 2 };

// --- Interactive playground ---
const toolbar: SxProps<Theme> = { mb: 2, flexWrap: "wrap" };

const spacer: SxProps<Theme> = { flexGrow: 1 };

const editor: SxProps<Theme> = {
  mt: 2,
  border: 1,
  borderColor: "divider",
  borderRadius: 2,
  maxHeight: 220,
  overflowY: "auto",
};

const editorRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 1,
  px: 1.5,
  py: 1,
  "&:not(:last-of-type)": { borderBottom: 1, borderColor: "divider" },
};

const editorIndex: SxProps<Theme> = {
  width: 28,
  color: "text.secondary",
  fontFamily: "monospace",
  fontSize: 13,
};

const coordField: SxProps<Theme> = { width: 130 };

const empty: SxProps<Theme> = { p: 2, color: "text.secondary" };

const styles: {
  intro: SxProps<Theme>;
  map: (height: number) => SxProps<Theme>;
  avatar: SxProps<Theme>;
  controls: SxProps<Theme>;
  toolbar: SxProps<Theme>;
  spacer: SxProps<Theme>;
  editor: SxProps<Theme>;
  editorRow: SxProps<Theme>;
  editorIndex: SxProps<Theme>;
  coordField: SxProps<Theme>;
  empty: SxProps<Theme>;
} = {
  intro,
  map,
  avatar,
  controls,
  toolbar,
  spacer,
  editor,
  editorRow,
  editorIndex,
  coordField,
  empty,
};

export default styles;

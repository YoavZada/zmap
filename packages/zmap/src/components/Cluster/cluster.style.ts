import type { SxProps, Theme } from "@mui/material/styles";

const bubble =
  (size: number, color: string, contrast: string): SxProps<Theme> =>
  (theme) => ({
    width: size,
    height: size,
    borderRadius: "50%",
    bgcolor: color,
    color: contrast,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: `0 0 0 4px ${theme.palette.action.disabledBackground}`,
    transition: "transform 120ms ease",
    "&:hover": { transform: "scale(1.08)" },
  });

const dot = (color: string): SxProps<Theme> => ({
  width: 14,
  height: 14,
  borderRadius: "50%",
  bgcolor: color,
  border: "2px solid",
  borderColor: "background.paper",
  boxShadow: 1,
  cursor: "pointer",
});

const styles: {
  bubble: (size: number, color: string, contrast: string) => SxProps<Theme>;
  dot: (color: string) => SxProps<Theme>;
} = { bubble, dot };
export default styles;

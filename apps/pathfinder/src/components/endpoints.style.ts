import type { SxProps, Theme } from "@mui/material/styles";

// Dynamic style — the badge color depends on which endpoint it is.
const pin =
  (palette: "success" | "error"): SxProps<Theme> =>
  (theme) => ({
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    lineHeight: 1,
    color: theme.palette[palette].contrastText,
    bgcolor: theme.palette[palette].main,
    border: `3px solid ${theme.palette.background.paper}`,
    boxShadow: theme.shadows[4],
    cursor: "grab",
    userSelect: "none",
  });

const styles: {
  pin: (palette: "success" | "error") => SxProps<Theme>;
} = { pin };

export default styles;

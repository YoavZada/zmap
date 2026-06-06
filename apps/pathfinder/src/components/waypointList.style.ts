import type { SxProps, Theme } from "@mui/material/styles";
import { rolePalette, type WaypointRole } from "./waypoints.style";

const list: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.75,
  maxHeight: 240,
  overflowY: "auto",
};

const empty: SxProps<Theme> = {
  color: "text.secondary",
  fontStyle: "italic",
};

const row: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  p: 0.75,
  borderRadius: 1,
  border: `1px solid ${theme.palette.divider}`,
});

// Dynamic style — the row badge color tracks the point's role in the route.
const badge =
  (role: WaypointRole): SxProps<Theme> =>
  (theme) => ({
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
    color: theme.palette[rolePalette[role]].contrastText,
    bgcolor: theme.palette[rolePalette[role]].main,
  });

const nameInput: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
  "& .MuiInput-input": {
    fontSize: 13,
    py: 0.25,
  },
};

const styles: {
  list: SxProps<Theme>;
  empty: SxProps<Theme>;
  row: SxProps<Theme>;
  badge: (role: WaypointRole) => SxProps<Theme>;
  nameInput: SxProps<Theme>;
} = { list, empty, row, badge, nameInput };

export default styles;

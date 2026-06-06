import type { SxProps, Theme } from "@mui/material/styles";

/** Which palette a waypoint badge uses, by its role in the route. */
export type WaypointRole = "start" | "end" | "stop";

/** Role → MUI palette key, shared by the map markers and the panel list. */
export const rolePalette: Record<
  WaypointRole,
  "success" | "error" | "secondary"
> = {
  start: "success",
  end: "error",
  stop: "secondary",
};

// Dynamic style — the badge color depends on the waypoint's role in the tour.
const pin =
  (role: WaypointRole): SxProps<Theme> =>
  (theme) => ({
    minWidth: 30,
    height: 30,
    px: 0.75,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 1,
    color: theme.palette[rolePalette[role]].contrastText,
    bgcolor: theme.palette[rolePalette[role]].main,
    border: `3px solid ${theme.palette.background.paper}`,
    boxShadow: theme.shadows[4],
    cursor: "grab",
    userSelect: "none",
    transition: theme.transitions.create(["transform"], { duration: 120 }),
    "&:active": { cursor: "grabbing" },
    "&:hover": { transform: "scale(1.08)" },
  });

// Container so the name pill can sit beside the badge without shifting the
// badge off the coordinate (the pill is absolutely positioned).
const wrap: SxProps<Theme> = {
  position: "relative",
  display: "inline-flex",
};

const label: SxProps<Theme> = (theme) => ({
  position: "absolute",
  left: "calc(100% + 6px)",
  top: "50%",
  transform: "translateY(-50%)",
  px: 0.75,
  py: 0.25,
  borderRadius: 1,
  bgcolor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.4,
  maxWidth: 160,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  pointerEvents: "none",
  userSelect: "none",
});

const styles: {
  pin: (role: WaypointRole) => SxProps<Theme>;
  wrap: SxProps<Theme>;
  label: SxProps<Theme>;
} = { pin, wrap, label };

export default styles;

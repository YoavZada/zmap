import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import Close from "@mui/icons-material/Close";
import type { RoutePoint } from "../lib/types";
import { type WaypointRole } from "./waypoints.style";
import Styles from "./waypointList.style";

export type WaypointListProps = {
  points: RoutePoint[];
  /**
   * Visiting position (0-based) per point, by list index — drives the badge
   * number/color. Null until a route exists (then falls back to list order).
   */
  visitOrder: number[] | null;
  onReorder: (id: number, direction: -1 | 1) => void;
  onRemove: (id: number) => void;
  onRename: (id: number, name: string) => void;
};

function roleFor(order: number, total: number): WaypointRole {
  if (total < 2) return "stop";
  if (order === 0) return "start";
  if (order === total - 1) return "end";
  return "stop";
}

/**
 * The editable list of dropped points. Each row shows the point's visiting
 * number (matching its map marker) and its coordinates; ↑/↓ reorder it and ×
 * removes it. Reordering drives the route order ("In my order").
 */
const WaypointList: FC<WaypointListProps> = ({
  points,
  visitOrder,
  onReorder,
  onRemove,
  onRename,
}) => {
  if (points.length === 0) {
    return (
      <Typography variant="body2" sx={Styles.empty}>
        No points yet — click the map to add one.
      </Typography>
    );
  }

  const order =
    visitOrder && visitOrder.length === points.length ? visitOrder : null;
  const last = points.length - 1;

  return (
    <Box sx={Styles.list}>
      {points.map((point, index) => {
        const position = order ? order[index] : index;
        const role = roleFor(position, points.length);
        return (
          <Box key={point.id} sx={Styles.row}>
            <Tooltip title={`${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`}>
              <Box sx={Styles.badge(role)}>{position + 1}</Box>
            </Tooltip>
            <TextField
              variant="standard"
              size="small"
              fullWidth
              value={point.name ?? ""}
              placeholder={`Point ${position + 1}`}
              onChange={(event) => onRename(point.id, event.target.value)}
              sx={Styles.nameInput}
              slotProps={{
                htmlInput: { "aria-label": `Name for point ${position + 1}` },
              }}
            />
            <Tooltip title="Move up">
              <span>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => onReorder(point.id, -1)}
                  aria-label="Move point up"
                >
                  <ArrowUpward fontSize="inherit" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Move down">
              <span>
                <IconButton
                  size="small"
                  disabled={index === last}
                  onClick={() => onReorder(point.id, 1)}
                  aria-label="Move point down"
                >
                  <ArrowDownward fontSize="inherit" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Remove point">
              <IconButton
                size="small"
                onClick={() => onRemove(point.id)}
                aria-label="Remove point"
              >
                <Close fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      })}
    </Box>
  );
};

export default WaypointList;

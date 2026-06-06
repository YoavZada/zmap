import type { FC } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { Marker } from "zmap";
import type { LngLatTuple } from "zmap";
import type { RoutePoint } from "../lib/types";
import Styles, { type WaypointRole } from "./waypoints.style";

export type WaypointsProps = {
  points: RoutePoint[];
  /**
   * Visiting position (0-based) per point, by input index — drives the badge
   * number and start/end colors. Null until a route exists, or while it's stale
   * (its length no longer matches `points`); then badges fall back to drop order.
   */
  visitOrder: number[] | null;
  onMove: (id: number, lngLat: LngLatTuple) => void;
  onRemove: (id: number) => void;
};

function roleFor(order: number, total: number): WaypointRole {
  if (total < 2) return "stop";
  if (order === 0) return "start";
  if (order === total - 1) return "end";
  return "stop";
}

/**
 * Draggable, numbered markers for each dropped point. The number is the point's
 * position in the route (the optimized order, once routed); drag to move a
 * point, click to remove it.
 */
const Waypoints: FC<WaypointsProps> = ({
  points,
  visitOrder,
  onMove,
  onRemove,
}) => {
  const order =
    visitOrder && visitOrder.length === points.length ? visitOrder : null;

  return (
    <>
      {points.map((point, index) => {
        const position = order ? order[index] : index;
        const role = roleFor(position, points.length);
        return (
          <Marker
            key={point.id}
            longitude={point.lng}
            latitude={point.lat}
            anchor="center"
            draggable
            onDragEnd={(lngLat) => onMove(point.id, lngLat)}
            onClick={() => onRemove(point.id)}
          >
            <Tooltip title="Click to remove · drag to move" arrow>
              <Box sx={Styles.wrap}>
                <Box sx={Styles.pin(role)}>{position + 1}</Box>
                {point.name ? <Box sx={Styles.label}>{point.name}</Box> : null}
              </Box>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
};

export default Waypoints;

import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Undo from "@mui/icons-material/Undo";
import RestartAlt from "@mui/icons-material/RestartAlt";
import AutoFixHigh from "@mui/icons-material/AutoFixHigh";
import FormatListNumbered from "@mui/icons-material/FormatListNumbered";
import { formatDistance, formatDuration } from "../lib/geo";
import type { RouteOrder } from "../lib/types";
import { CITIES, type City } from "../lib/cities";
import type { Pathfinder } from "../hooks/usePathfinder";
import WaypointList from "./WaypointList";
import Styles from "./controlPanel.style";

export type ControlPanelProps = {
  pathfinder: Pathfinder;
  city: City;
  onCityChange: (city: City) => void;
};

type Status = { text: string; tone: "info" | "success" | "error" };

function statusFor(pf: Pathfinder): Status {
  if (pf.phase === "error")
    return { text: pf.error ?? "Routing failed.", tone: "error" };
  if (pf.phase === "routing")
    return { text: "Finding the best route…", tone: "info" };
  if (pf.phase === "done" && pf.result)
    return {
      text:
        pf.points.length < 3
          ? "Best driving route found."
          : pf.order === "optimized"
            ? "Fastest tour found — visiting order is optimized."
            : "Route found — visiting points in your order.",
      tone: "success",
    };
  if (pf.points.length === 0)
    return { text: "Click the map to drop your first point.", tone: "info" };
  return { text: "Drop another point to build a route.", tone: "info" };
}

const ControlPanel: FC<ControlPanelProps> = ({
  pathfinder,
  city,
  onCityChange,
}) => {
  const {
    points,
    result,
    phase,
    order,
    removePoint,
    removeLast,
    reorderPoint,
    renamePoint,
    changeOrder,
    clear,
  } = pathfinder;
  const status = statusFor(pathfinder);
  const showStats = phase === "done" && result != null;
  const hasPoints = points.length > 0;
  const visitOrder =
    result && result.visitOrder.length === points.length
      ? result.visitOrder
      : null;

  return (
    <Box sx={Styles.root}>
      <Box sx={Styles.intro}>
        <Typography variant="h5" fontWeight={700}>
          Route Pathfinder
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Drop points anywhere on the map and get the best driving route along
          the real streets. With three or more points, optimize the visiting
          order for the fastest tour — or keep your own order.
        </Typography>
      </Box>

      <Divider />

      <Box sx={Styles.section}>
        <Typography variant="caption" sx={Styles.sectionLabel}>
          Start location
        </Typography>
        <TextField
          select
          size="small"
          fullWidth
          value={city.id}
          onChange={(event) => {
            const next = CITIES.find((c) => c.id === event.target.value);
            if (next) onCityChange(next);
          }}
        >
          {CITIES.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="caption" sx={Styles.sectionLabel}>
          Visiting order
        </Typography>
        <ToggleButtonGroup
          orientation="vertical"
          exclusive
          fullWidth
          size="small"
          value={order}
          onChange={(_, value: RouteOrder | null) =>
            value && changeOrder(value)
          }
          sx={Styles.toggleGroup}
        >
          <ToggleButton value="optimized">
            <AutoFixHigh fontSize="small" />
            Optimized (fastest tour)
          </ToggleButton>
          <ToggleButton value="fixed">
            <FormatListNumbered fontSize="small" />
            In my order (as dropped)
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="caption" sx={Styles.sectionLabel}>
          Points{hasPoints ? ` (${points.length})` : ""}
        </Typography>
        <WaypointList
          points={points}
          visitOrder={visitOrder}
          onReorder={reorderPoint}
          onRemove={removePoint}
          onRename={renamePoint}
        />
        {points.length > 1 && (
          <Typography variant="caption" color="text.secondary">
            Use ↑ ↓ to set the visiting order — the route follows the list.
          </Typography>
        )}
      </Box>

      <Box sx={Styles.actions}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<Undo />}
          disabled={!hasPoints}
          onClick={removeLast}
        >
          Remove last
        </Button>
        <Button
          variant="outlined"
          startIcon={<RestartAlt />}
          disabled={!hasPoints}
          onClick={clear}
        >
          Clear
        </Button>
      </Box>

      <Box sx={Styles.status}>
        <Typography
          variant="body2"
          fontWeight={600}
          color={
            status.tone === "error"
              ? "error.main"
              : status.tone === "success"
                ? "success.main"
                : "text.primary"
          }
        >
          {status.text}
        </Typography>
      </Box>

      {showStats && result && (
        <Box sx={Styles.statsGrid}>
          <Box sx={Styles.stat}>
            <Typography variant="caption" color="text.secondary">
              Total distance
            </Typography>
            <Typography variant="h6" sx={Styles.statValue}>
              {formatDistance(result.distanceMeters)}
            </Typography>
          </Box>
          <Box sx={Styles.stat}>
            <Typography variant="caption" color="text.secondary">
              Est. driving time
            </Typography>
            <Typography variant="h6" sx={Styles.statValue}>
              {formatDuration(result.durationSeconds)}
            </Typography>
          </Box>
          <Box sx={Styles.stat}>
            <Typography variant="caption" color="text.secondary">
              Points
            </Typography>
            <Typography variant="h6" sx={Styles.statValue}>
              {points.length}
            </Typography>
          </Box>
          <Box sx={Styles.stat}>
            <Typography variant="caption" color="text.secondary">
              Mode
            </Typography>
            <Typography variant="h6" sx={Styles.statValue}>
              {points.length < 3
                ? "Direct route"
                : order === "optimized"
                  ? "Optimal tour"
                  : "My order"}
            </Typography>
          </Box>
        </Box>
      )}

      <Divider />

      <Box sx={Styles.section}>
        <Typography variant="caption" sx={Styles.sectionLabel}>
          Legend
        </Typography>
        <Box sx={Styles.legendRow}>
          <Box sx={Styles.swatch("success.main")} />
          <Typography variant="body2">Start (1)</Typography>
        </Box>
        <Box sx={Styles.legendRow}>
          <Box sx={Styles.swatch("secondary.main")} />
          <Typography variant="body2">Stop along the way</Typography>
        </Box>
        <Box sx={Styles.legendRow}>
          <Box sx={Styles.swatch("error.main")} />
          <Typography variant="body2">Destination (last)</Typography>
        </Box>
        <Box sx={Styles.legendRow}>
          <Box sx={Styles.swatchLine("primary.main")} />
          <Typography variant="body2">Shortest route</Typography>
        </Box>
        <Box sx={Styles.legendRow}>
          <Box sx={Styles.swatchLine("text.secondary")} />
          <Typography variant="body2">Link to nearest street</Typography>
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Each point snaps to the nearest street; only on-street travel counts.
        Drag a point to move it, click a point to remove it. Routing by{" "}
        <Link
          href="https://project-osrm.org/"
          target="_blank"
          rel="noopener"
          underline="hover"
        >
          OSRM
        </Link>{" "}
        · © OpenStreetMap contributors.
      </Typography>
    </Box>
  );
};

export default ControlPanel;

import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Divider from "@mui/material/Divider";
import Search from "@mui/icons-material/Search";
import RestartAlt from "@mui/icons-material/RestartAlt";
import Straighten from "@mui/icons-material/Straighten";
import AltRoute from "@mui/icons-material/AltRoute";
import type { Metric } from "../lib/types";
import { formatDistance } from "../lib/geo";
import type { Pathfinder } from "../hooks/usePathfinder";
import Styles from "./controlPanel.style";

export type ControlPanelProps = {
  pathfinder: Pathfinder;
  nodeCount: number;
  edgeCount: number;
};

type Status = { text: string; tone: "info" | "success" | "error" };

function statusFor(pf: Pathfinder): Status {
  if (pf.phase === "animating")
    return { text: "Running Dijkstra…", tone: "info" };
  if (pf.phase === "no-path")
    return { text: "No path connects A and B.", tone: "error" };
  if (pf.phase === "done" && pf.result?.found)
    return { text: "Shortest path found.", tone: "success" };
  if (pf.start === null)
    return { text: "Click the map to drop point A.", tone: "info" };
  if (pf.end === null)
    return { text: "Click again to drop point B.", tone: "info" };
  return { text: "Ready — press Find shortest path.", tone: "info" };
}

const ControlPanel: FC<ControlPanelProps> = ({
  pathfinder,
  nodeCount,
  edgeCount,
}) => {
  const { metric, result, phase, canRun, changeMetric, run, reset } =
    pathfinder;
  const status = statusFor(pathfinder);
  const showStats = result?.found === true;

  return (
    <Box sx={Styles.root}>
      <Box sx={Styles.intro}>
        <Typography variant="h5" fontWeight={700}>
          Dijkstra Pathfinder
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pick two points on the road network and watch Dijkstra's algorithm
          fan out to find the shortest route between them.
        </Typography>
      </Box>

      <Divider />

      <Box sx={Styles.section}>
        <Typography variant="caption" sx={Styles.sectionLabel}>
          Optimize for
        </Typography>
        <ToggleButtonGroup
          orientation="vertical"
          exclusive
          fullWidth
          size="small"
          value={metric}
          onChange={(_, value: Metric | null) => value && changeMetric(value)}
          sx={Styles.toggleGroup}
        >
          <ToggleButton value="distance">
            <Straighten fontSize="small" />
            Shortest distance (road length)
          </ToggleButton>
          <ToggleButton value="stops">
            <AltRoute fontSize="small" />
            Fewest stops (intersections)
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={Styles.actions}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<Search />}
          disabled={!canRun || phase === "animating"}
          onClick={run}
        >
          Find shortest path
        </Button>
        <Button
          variant="outlined"
          startIcon={<RestartAlt />}
          onClick={reset}
        >
          Reset
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
              {formatDistance(result.lengthMeters)}
            </Typography>
          </Box>
          <Box sx={Styles.stat}>
            <Typography variant="caption" color="text.secondary">
              Segments
            </Typography>
            <Typography variant="h6" sx={Styles.statValue}>
              {result.segments}
            </Typography>
          </Box>
          <Box sx={Styles.stat}>
            <Typography variant="caption" color="text.secondary">
              Nodes explored
            </Typography>
            <Typography variant="h6" sx={Styles.statValue}>
              {result.exploredCount}
            </Typography>
          </Box>
          <Box sx={Styles.stat}>
            <Typography variant="caption" color="text.secondary">
              Optimized for
            </Typography>
            <Typography variant="h6" sx={Styles.statValue}>
              {metric === "distance" ? "Distance" : "Stops"}
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
          <Typography variant="body2">Start (A)</Typography>
        </Box>
        <Box sx={Styles.legendRow}>
          <Box sx={Styles.swatch("error.main")} />
          <Typography variant="body2">Destination (B)</Typography>
        </Box>
        <Box sx={Styles.legendRow}>
          <Box sx={Styles.swatchLine("secondary.main")} />
          <Typography variant="body2">Explored (search tree)</Typography>
        </Box>
        <Box sx={Styles.legendRow}>
          <Box sx={Styles.swatchLine("primary.main")} />
          <Typography variant="body2">Shortest path</Typography>
        </Box>
        <Box sx={Styles.legendRow}>
          <Box sx={Styles.swatchLine("grey.500")} />
          <Typography variant="body2">Road network</Typography>
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Simulated network of {nodeCount.toLocaleString()} intersections and{" "}
        {edgeCount.toLocaleString()} road segments. Drag A or B to re-route.
      </Typography>
    </Box>
  );
};

export default ControlPanel;

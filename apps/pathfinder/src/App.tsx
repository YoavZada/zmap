import { useMemo, type FC } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Brightness4 from "@mui/icons-material/Brightness4";
import Brightness7 from "@mui/icons-material/Brightness7";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import { generateRoadNetwork } from "./lib/network";
import { usePathfinder } from "./hooks/usePathfinder";
import MapCanvas from "./components/MapCanvas";
import ControlPanel from "./components/ControlPanel";
import { useColorMode } from "./theme";
import Styles from "./app.style";

const App: FC = () => {
  const { mode, toggle } = useColorMode();

  // Generated once: a jittered street grid over Manhattan with some segments
  // removed so the shortest path has to detour. Seeded → stable across reloads.
  const network = useMemo(
    () =>
      generateRoadNetwork({
        center: [-73.9857, 40.7484],
        cols: 19,
        rows: 15,
        span: [0.052, 0.034],
        jitter: 0.5,
        dropProbability: 0.16,
        seed: 20240605,
      }),
    [],
  );

  const pathfinder = usePathfinder(network);

  return (
    <Box sx={Styles.root}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <Box sx={Styles.brand}>
            <RouteOutlined color="primary" />
            <Typography variant="h6" fontWeight={700}>
              zmap · Dijkstra Pathfinder
            </Typography>
          </Box>
          <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
            <IconButton onClick={toggle} color="inherit">
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box sx={Styles.main}>
        <Box sx={Styles.mapArea}>
          <MapCanvas network={network} pathfinder={pathfinder} />
        </Box>
        <Box sx={Styles.panel}>
          <ControlPanel
            pathfinder={pathfinder}
            nodeCount={network.nodes.length}
            edgeCount={network.edges.length}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default App;

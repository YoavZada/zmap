import { useCallback, useState, type FC } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Brightness4 from "@mui/icons-material/Brightness4";
import Brightness7 from "@mui/icons-material/Brightness7";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import { usePathfinder } from "./hooks/usePathfinder";
import MapCanvas from "./components/MapCanvas";
import ControlPanel from "./components/ControlPanel";
import { DEFAULT_CITY, type City } from "./lib/cities";
import { useColorMode } from "./theme";
import { DOCS_URL } from "./env";
import Styles from "./app.style";

const App: FC = () => {
  const { mode, toggle } = useColorMode();

  const pathfinder = usePathfinder();
  const { clear } = pathfinder;
  const [city, setCity] = useState<City>(DEFAULT_CITY);

  // Switching cities recenters the map; the dropped points belonged to the old
  // location, so clear them.
  const handleCityChange = useCallback(
    (next: City) => {
      setCity(next);
      clear();
    },
    [clear],
  );

  return (
    <Box sx={Styles.root}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <Box sx={Styles.brand}>
            <RouteOutlined color="primary" />
            <Typography variant="h6" fontWeight={700}>
              zmap · Route Pathfinder
            </Typography>
          </Box>
          <Button
            color="inherit"
            component="a"
            href={DOCS_URL}
            startIcon={<MenuBookOutlined />}
            sx={Styles.docsLink}
          >
            Docs
          </Button>
          <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
            <IconButton onClick={toggle} color="inherit">
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box sx={Styles.main}>
        <Box sx={Styles.mapArea}>
          <MapCanvas pathfinder={pathfinder} city={city} />
        </Box>
        <Box sx={Styles.panel}>
          <ControlPanel
            pathfinder={pathfinder}
            city={city}
            onCityChange={handleCityChange}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default App;

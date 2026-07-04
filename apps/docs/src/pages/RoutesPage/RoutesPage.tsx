import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DemoSection from "../../components/DemoSection";
import PropsTable from "../../components/PropsTable";
import RouteDemo from "../../demos/routes/RouteDemo";
import routeDemoSource from "../../demos/routes/RouteDemo.tsx?raw";
import Styles from "./routesPage.style";

const RoutesPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Routes
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        <code>Route</code> draws a polyline from a list of coordinates as a
        GPU-rendered line layer. Colors accept MUI palette tokens like{" "}
        <code>"primary.main"</code>, and the line survives theme changes.
      </Typography>

      <DemoSection
        title="A walking route through London"
        description="Adjust the stroke and toggle a dashed style. The code shown is the demo's actual source."
        code={routeDemoSource}
        demo={<RouteDemo />}
      />
      <PropsTable component="Route" />
    </Box>
  );
};

export default RoutesPage;

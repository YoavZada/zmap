import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DemoSection from "../components/DemoSection";
import PropsTable from "../components/PropsTable";
import ArcDemo from "../demos/arcs/ArcDemo";
import arcDemoSource from "../demos/arcs/ArcDemo.tsx?raw";
import Styles from "./arcsPage.style";

export const ArcsPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Arcs
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        <code>Arc</code> draws a curved line between two points — perfect for
        flight paths and connection maps. Choose a <code>"bezier"</code> bulge
        or a <code>"geodesic"</code> great-circle path.
      </Typography>

      <DemoSection
        title="Flights out of New York"
        description="Tune the curvature or switch to a great-circle path. The code shown is the demo's actual source."
        code={arcDemoSource}
        demo={<ArcDemo />}
      />
      <PropsTable component="Arc" />
    </Box>
  );
};

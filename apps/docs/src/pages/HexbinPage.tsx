import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DemoSection from "../components/DemoSection";
import PropsTable from "../components/PropsTable";
import HexbinDemo from "../demos/hexbins/HexbinDemo";
import hexbinDemoSource from "../demos/hexbins/HexbinDemo.tsx?raw";
import SquareGridDemo from "../demos/hexbins/SquareGridDemo";
import squareGridDemoSource from "../demos/hexbins/SquareGridDemo.tsx?raw";
import ExtrudedBinsDemo from "../demos/hexbins/ExtrudedBinsDemo";
import extrudedBinsDemoSource from "../demos/hexbins/ExtrudedBinsDemo.tsx?raw";
import Styles from "./hexbinPage.style";

export const HexbinPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Hexbins & grids
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        <code>&lt;HexbinLayer&gt;</code> aggregates scattered points into
        hexagonal (or square) cells colored by how many fall in each — a clearer
        read of density than a heatmap at a glance, and steadier than clustering
        as you pan. Bins can sum a weight property instead of counting, and
        extrude into 3D columns. Colors are a themed choropleth ramp, so they
        follow light/dark mode.
      </Typography>

      <DemoSection
        title="Hexbins"
        description="Each hexagon is colored by the number of points it contains."
        code={hexbinDemoSource}
        demo={<HexbinDemo />}
      />

      <DemoSection
        title="Square grid"
        description='Switch cell="square" for a rectangular grid — same aggregation, different tessellation.'
        code={squareGridDemoSource}
        demo={<SquareGridDemo />}
      />

      <DemoSection
        title="Extruded bins"
        description="Sum a weight property and raise each cell into a 3D column. Tilt with the cube control to read the relief."
        code={extrudedBinsDemoSource}
        demo={<ExtrudedBinsDemo />}
      />
      <PropsTable component="HexbinLayer" />
    </Box>
  );
};

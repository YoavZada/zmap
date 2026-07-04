import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DemoSection from "../components/DemoSection";
import PropsTable from "../components/PropsTable";
import ExtrudedBuildingsDemo from "../demos/extrusion/ExtrudedBuildingsDemo";
import extrudedBuildingsDemoSource from "../demos/extrusion/ExtrudedBuildingsDemo.tsx?raw";
import ExtrudedDataDemo from "../demos/extrusion/ExtrudedDataDemo";
import extrudedDataDemoSource from "../demos/extrusion/ExtrudedDataDemo.tsx?raw";
import Styles from "./extrusionPage.style";

export const ExtrusionPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        3D Extrusion
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        <code>&lt;ExtrusionLayer&gt;</code> raises GeoJSON polygons into 3D
        prisms (MapLibre <code>fill-extrusion</code>) — for buildings or any
        value mapped to height. Height can be constant or driven by a feature
        property, and the fill can be a flat color or a data-driven choropleth.
        Pair it with <code>&lt;MapControls showPitch /&gt;</code>, which adds a
        tilt toggle so you can drop into 3D. Hit the cube button (top-right) to
        tilt.
      </Typography>

      <DemoSection
        title="Extruded buildings"
        description="A block of Midtown footprints, each raised to its height in meters. Tilt with the cube control, then drag to orbit."
        code={extrudedBuildingsDemoSource}
        demo={<ExtrudedBuildingsDemo />}
      />

      <DemoSection
        title="Extruded data (3D choropleth)"
        description="The same value drives both color and height — denser states glow hotter and rise higher."
        code={extrudedDataDemoSource}
        demo={<ExtrudedDataDemo />}
      />
      <PropsTable component="ExtrusionLayer" />
    </Box>
  );
};

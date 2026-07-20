import type { FC } from "react";
import Box from "@mui/material/Box";
import DemoSection from "../../components/DemoSection";
import PageHeader from "../../components/PageHeader";
import PropsTable from "../../components/PropsTable";
import ExtrudedBuildingsDemo from "../../demos/extrusion/ExtrudedBuildingsDemo";
import extrudedBuildingsDemoSource from "../../demos/extrusion/ExtrudedBuildingsDemo.tsx?raw";
import ExtrudedDataDemo from "../../demos/extrusion/ExtrudedDataDemo";
import extrudedDataDemoSource from "../../demos/extrusion/ExtrudedDataDemo.tsx?raw";

const ExtrusionPage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="3D Extrusion"
        lead={
          <>
            <code>&lt;ExtrusionLayer&gt;</code> raises GeoJSON polygons into 3D
            prisms (MapLibre <code>fill-extrusion</code>) — for buildings or any
            value mapped to height. Height can be constant or driven by a
            feature property, and the fill can be a flat color or a data-driven
            choropleth. Pair it with{" "}
            <code>&lt;MapControls showPitch /&gt;</code>, which adds a tilt
            toggle so you can drop into 3D. Hit the cube button (top-right) to
            tilt.
          </>
        }
      />

      <DemoSection
        title="Extruded buildings"
        description="A block of Midtown footprints, each raised — and tinted — by its height in meters. Tilt with the cube control, then drag to orbit."
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

export default ExtrusionPage;

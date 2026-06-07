import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Map, MapControls, ExtrusionLayer, Legend } from "zmapgl";
import type { ChoroplethSpec } from "zmapgl";
import DemoSection from "../components/DemoSection";
import Styles from "./extrusionPage.style";
import { buildings, usStates } from "../data";

// One spec drives both the extrusion color and its legend.
const stateRamp: ChoroplethSpec = {
  property: "value",
  type: "interpolate",
  stops: [
    [0, "info.light"],
    [150, "warning.light"],
    [300, "warning.main"],
    [450, "error.main"],
  ],
};

const buildingsCode = `import type { FC } from "react";
import { Map, MapControls, ExtrusionLayer } from "zmapgl";

// buildings: GeoJSON polygons whose features carry a numeric "height" (meters).
const MyMap: FC = () => {
  return (
    <Map
      center={[-73.984, 40.748]}
      zoom={14.6}
      initialView={{ pitch: 55, bearing: -18 }}
    >
      {/* showPitch adds a tilt (3D) toggle to the control cluster */}
      <MapControls position="top-right" showPitch />

      <ExtrusionLayer
        data={buildings}
        heightProperty="height"   // drive height from the data
        color="primary.main"
        opacity={0.92}
      />
    </Map>
  );
};

export default MyMap;`;

const dataCode = `import type { FC } from "react";
import { Map, MapControls, ExtrusionLayer, Legend } from "zmapgl";
import type { ChoroplethSpec } from "zmapgl";

const ramp: ChoroplethSpec = {
  property: "value",
  type: "interpolate",
  stops: [[0, "info.light"], [150, "warning.light"], [300, "warning.main"], [450, "error.main"]],
};

const MyMap: FC = () => {
  return (
    <Map center={[-96, 38]} zoom={3.2} initialView={{ pitch: 50 }}>
      <MapControls position="top-right" showPitch />

      {/* color AND height both driven by the same value — a 3D choropleth */}
      <ExtrusionLayer data={usStates} color={ramp} heightProperty="value" heightScale={1300} opacity={0.9} />
      <Legend title="Population density" spec={ramp} formatValue={(v) => \`\${v}/mi²\`} />
    </Map>
  );
};

export default MyMap;`;

export function ExtrusionPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        3D Extrusion
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        <code>&lt;ExtrusionLayer&gt;</code> raises GeoJSON polygons into 3D prisms
        (MapLibre <code>fill-extrusion</code>) — for buildings or any value mapped
        to height. Height can be constant or driven by a feature property, and
        the fill can be a flat color or a data-driven choropleth. Pair it with{" "}
        <code>&lt;MapControls showPitch /&gt;</code>, which adds a tilt toggle so
        you can drop into 3D. Hit the cube button (top-right) to tilt.
      </Typography>

      <DemoSection
        title="Extruded buildings"
        description="A block of Midtown footprints, each raised to its height in meters. Tilt with the cube control, then drag to orbit."
        code={buildingsCode}
        demo={
          <Map
            center={[-73.984, 40.748]}
            zoom={14.6}
            initialView={{ pitch: 55, bearing: -18 }}
            sx={Styles.map}
          >
            <MapControls position="top-right" showPitch />
            <ExtrusionLayer
              data={buildings}
              heightProperty="height"
              color="primary.main"
              opacity={0.92}
            />
          </Map>
        }
      />

      <DemoSection
        title="Extruded data (3D choropleth)"
        description="The same value drives both color and height — denser states glow hotter and rise higher."
        code={dataCode}
        demo={
          <Map
            center={[-96, 38]}
            zoom={3.2}
            initialView={{ pitch: 50 }}
            sx={Styles.map}
          >
            <MapControls position="top-right" showPitch />
            <ExtrusionLayer
              data={usStates}
              color={stateRamp}
              heightProperty="value"
              heightScale={1300}
              opacity={0.9}
            />
            <Legend
              title="Population density"
              spec={stateRamp}
              formatValue={(v) => `${v}/mi²`}
            />
          </Map>
        }
      />
    </Box>
  );
}

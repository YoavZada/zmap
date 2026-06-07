import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Map, MapControls, HexbinLayer, Legend } from "zmapgl";
import DemoSection from "../components/DemoSection";
import Styles from "./hexbinPage.style";
import { scatterPoints } from "../data";

const densityKey = [
  { color: "error.main", label: "High" },
  { color: "warning.main", label: "Medium" },
  { color: "info.light", label: "Low" },
];

const hexCode = `import type { FC } from "react";
import { Map, HexbinLayer, Legend } from "zmapgl";

// scatterPoints: an array of { longitude, latitude, properties }.
const MyMap: FC = () => {
  return (
    <Map center={[-96, 38]} zoom={3.4}>
      <HexbinLayer points={scatterPoints} radius={70} />
      <Legend
        title="Points per cell"
        items={[
          { color: "error.main", label: "High" },
          { color: "warning.main", label: "Medium" },
          { color: "info.light", label: "Low" },
        ]}
      />
    </Map>
  );
};

export default MyMap;`;

const squareCode = `import type { FC } from "react";
import { Map, HexbinLayer } from "zmapgl";

const MyMap: FC = () => {
  return (
    <Map center={[-96, 38]} zoom={3.4}>
      {/* cell="square" for a rectangular grid instead of hexagons */}
      <HexbinLayer points={scatterPoints} cell="square" radius={70} />
    </Map>
  );
};

export default MyMap;`;

const extrudedCode = `import type { FC } from "react";
import { Map, MapControls, HexbinLayer } from "zmapgl";

const MyMap: FC = () => {
  return (
    <Map center={[-118.2, 34.05]} zoom={7.8} initialView={{ pitch: 55 }}>
      <MapControls position="top-right" showPitch />
      {/* sum a weight property and raise each bin into a 3D column */}
      <HexbinLayer
        points={scatterPoints}
        radius={16}
        weightProperty="magnitude"
        extruded
        heightScale={700}
      />
    </Map>
  );
};

export default MyMap;`;

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
        code={hexCode}
        demo={
          <Map center={[-96, 38]} zoom={3.4} sx={Styles.map}>
            <HexbinLayer points={scatterPoints} radius={70} />
            <Legend
              title="Points per cell"
              items={densityKey}
              position="bottom-right"
            />
          </Map>
        }
      />

      <DemoSection
        title="Square grid"
        description='Switch cell="square" for a rectangular grid — same aggregation, different tessellation.'
        code={squareCode}
        demo={
          <Map center={[-96, 38]} zoom={3.4} sx={Styles.map}>
            <HexbinLayer points={scatterPoints} cell="square" radius={70} />
          </Map>
        }
      />

      <DemoSection
        title="Extruded bins"
        description="Sum a weight property and raise each cell into a 3D column. Tilt with the cube control to read the relief."
        code={extrudedCode}
        demo={
          <Map
            center={[-118.2, 34.05]}
            zoom={7.8}
            initialView={{ pitch: 55 }}
            sx={Styles.map}
          >
            <MapControls position="top-right" showPitch />
            <HexbinLayer
              points={scatterPoints}
              radius={16}
              weightProperty="magnitude"
              extruded
              heightScale={700}
            />
          </Map>
        }
      />
    </Box>
  );
};

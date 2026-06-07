import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Map, ChoroplethLayer } from "zmapgl";
import DemoSection from "../components/DemoSection";
import Styles from "./choroplethPage.style";
import { usStates } from "../data";

const rampStops: [number, string][] = [
  [0, "info.light"],
  [150, "warning.light"],
  [300, "warning.main"],
  [450, "error.main"],
];

const stepStops: [number, string][] = [
  [0, "success.light"],
  [100, "info.main"],
  [250, "warning.main"],
  [400, "error.main"],
];

const density = (v: number) => `${v}/mi²`;

const rampCode = `import type { FC } from "react";
import { Map, ChoroplethLayer } from "zmapgl";

// usStates: a GeoJSON FeatureCollection whose features carry a numeric "value".
const MyMap: FC = () => {
  return (
    <Map center={[-96, 38]} zoom={3.2}>
      <ChoroplethLayer
        data={usStates}
        property="value"          // the numeric property to color by
        stops={[
          [0, "info.light"],      // palette tokens or any CSS color
          [150, "warning.light"],
          [300, "warning.main"],
          [450, "error.main"],
        ]}
        fillOpacity={0.7}
        legend={{ title: "Population density", formatValue: (v) => \`\${v}/mi²\` }}
      />
    </Map>
  );
};

export default MyMap;`;

const stepCode = `import type { FC } from "react";
import { Map, ChoroplethLayer } from "zmapgl";

const MyMap: FC = () => {
  return (
    <Map center={[-96, 38]} zoom={3.2}>
      <ChoroplethLayer
        data={usStates}
        property="value"
        scale="step"              // banded instead of a smooth ramp
        stops={[
          [0, "success.light"],
          [100, "info.main"],
          [250, "warning.main"],
          [400, "error.main"],
        ]}
        fillOpacity={0.75}
        legend={{ title: "Density bands", position: "bottom-left", formatValue: (v) => \`\${v}/mi²\` }}
      />
    </Map>
  );
};

export default MyMap;`;

export const ChoroplethPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Choropleth
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        <code>&lt;ChoroplethLayer&gt;</code> maps a numeric feature property to
        a color — smoothly (<code>interpolate</code>) or in bands (
        <code>step</code>) — and can drop a matching <code>&lt;Legend&gt;</code>{" "}
        built from the very same stops, so the key never drifts from the map.
        Stops accept MUI palette tokens, so the whole thing re-themes with your
        app. Toggle dark mode to see it follow.
      </Typography>

      <DemoSection
        title="Continuous ramp"
        description="A smooth interpolation across the stops, with a gradient legend."
        code={rampCode}
        demo={
          <Map center={[-96, 38]} zoom={3.2} sx={Styles.map}>
            <ChoroplethLayer
              data={usStates}
              property="value"
              stops={rampStops}
              fillOpacity={0.7}
              legend={{
                title: "Population density",
                formatValue: density,
              }}
            />
          </Map>
        }
      />

      <DemoSection
        title="Stepped bands"
        description='Set scale="step" for discrete bands; the legend switches to banded swatches automatically.'
        code={stepCode}
        demo={
          <Map center={[-96, 38]} zoom={3.2} sx={Styles.map}>
            <ChoroplethLayer
              data={usStates}
              property="value"
              scale="step"
              stops={stepStops}
              fillOpacity={0.75}
              legend={{
                title: "Density bands",
                position: "bottom-left",
                formatValue: density,
              }}
            />
          </Map>
        }
      />
    </Box>
  );
};

import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DemoSection from "../components/DemoSection";
import PropsTable from "../components/PropsTable";
import ChoroplethRampDemo from "../demos/choropleth/ChoroplethRampDemo";
import choroplethRampDemoSource from "../demos/choropleth/ChoroplethRampDemo.tsx?raw";
import ChoroplethStepDemo from "../demos/choropleth/ChoroplethStepDemo";
import choroplethStepDemoSource from "../demos/choropleth/ChoroplethStepDemo.tsx?raw";
import Styles from "./choroplethPage.style";

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
        code={choroplethRampDemoSource}
        demo={<ChoroplethRampDemo />}
      />

      <DemoSection
        title="Stepped bands"
        description='Set scale="step" for discrete bands; the legend switches to banded swatches automatically.'
        code={choroplethStepDemoSource}
        demo={<ChoroplethStepDemo />}
      />
      <PropsTable component="ChoroplethLayer" />
    </Box>
  );
};

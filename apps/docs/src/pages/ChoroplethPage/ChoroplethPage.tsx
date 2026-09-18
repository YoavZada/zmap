import type { FC } from "react";
import Box from "@mui/material/Box";
import DemoSection from "../../components/DemoSection";
import PageHeader from "../../components/PageHeader";
import PropsTable from "../../components/PropsTable";
import ChoroplethRampDemo from "../../demos/choropleth/ChoroplethRampDemo";
import choroplethRampDemoSource from "../../demos/choropleth/ChoroplethRampDemo.tsx?raw";
import ChoroplethStepDemo from "../../demos/choropleth/ChoroplethStepDemo";
import choroplethStepDemoSource from "../../demos/choropleth/ChoroplethStepDemo.tsx?raw";
import HoverFeatureStateDemo from "../../demos/choropleth/HoverFeatureStateDemo";
import hoverFeatureStateDemoSource from "../../demos/choropleth/HoverFeatureStateDemo.tsx?raw";

const ChoroplethPage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Choropleth"
        lead={
          <>
            <code>&lt;ChoroplethLayer&gt;</code> maps a numeric feature property
            to a color — smoothly (<code>interpolate</code>) or in bands (
            <code>step</code>) — and can drop a matching{" "}
            <code>&lt;Legend&gt;</code> built from the very same stops, so the
            key never drifts from the map. Stops accept MUI palette tokens, so
            the whole thing re-themes with your app. Toggle dark mode to see it
            follow.
          </>
        }
      />

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

      <DemoSection
        title="Hover highlighting — hoverHighlight + onHover"
        description={
          <>
            <code>hoverHighlight</code> and <code>onHover</code> turn hovering a
            feature into a one-prop affair — no manual feature-state or layer
            ids needed. Under the hood it still mirrors pointer hover into
            MapLibre feature-state (the low-level route is the{" "}
            <code>useFeatureState</code> hook, for when you need the hovered
            feature in your own render tree without a paint change). Hover a
            state.
          </>
        }
        code={hoverFeatureStateDemoSource}
        demo={<HoverFeatureStateDemo />}
      />
      <PropsTable component="ChoroplethLayer" />
    </Box>
  );
};

export default ChoroplethPage;

import type { FC } from "react";
import Box from "@mui/material/Box";
import DemoSection from "../../components/DemoSection";
import PageHeader from "../../components/PageHeader";
import PropsTable from "../../components/PropsTable";
import LayerControlDemo from "../../demos/layers/LayerControlDemo";
import layerControlDemoSource from "../../demos/layers/LayerControlDemo.tsx?raw";
import LegendDemo from "../../demos/layers/LegendDemo";
import legendDemoSource from "../../demos/layers/LegendDemo.tsx?raw";
import GeoJSONLayerDemo from "../../demos/layers/GeoJSONLayerDemo";
import geoJSONLayerDemoSource from "../../demos/layers/GeoJSONLayerDemo.tsx?raw";
import GeoJSONFromUrlDemo from "../../demos/layers/GeoJSONFromUrlDemo";
import geoJSONFromUrlDemoSource from "../../demos/layers/GeoJSONFromUrlDemo.tsx?raw";

const LayersPage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Layers"
        lead={
          <>
            Wrap any map content in a <code>&lt;Layer&gt;</code> and drop in a{" "}
            <code>&lt;LayerControl&gt;</code> to get a checkbox panel that
            toggles each overlay. A layer can be anything — points, a heatmap,
            GeoJSON shapes (here with a data-driven choropleth fill), clusters,
            routes. Open the panel (top-right) and toggle the overlays.
          </>
        }
      />

      <DemoSection
        title="Toggleable overlays"
        description="Points, a density heatmap, and choropleth regions — each its own layer."
        code={layerControlDemoSource}
        demo={<LayerControlDemo />}
      />

      <DemoSection
        title="Themed legend"
        description={
          <>
            A <code>&lt;Legend&gt;</code> reads the same{" "}
            <code>ChoroplethSpec</code> you hand the layer, so its swatches stay
            in lock-step with the fill — pass <code>spec</code> for a continuous
            ramp (or banded <code>step</code> swatches), or an{" "}
            <code>items</code> list for a categorical key. Like every zmap
            control, it's plain MUI, so it follows the theme. Toggle dark mode.
          </>
        }
        code={legendDemoSource}
        demo={<LegendDemo />}
      />

      <DemoSection
        title="GeoJSONLayer — the escape hatch"
        description={
          <>
            <code>&lt;GeoJSONLayer&gt;</code> is the low-level primitive behind{" "}
            <code>ShapeLayer</code> and <code>PointLayer</code>: hand it a
            GeoJSON source and an array of raw MapLibre layer specs — any layer
            type, full paint/layout control, data-driven expressions — and it
            keeps them alive across theme-driven style swaps. Reach for it when
            the higher-level components don't fit. Here it renders a London
            walking route as a dashed line plus circles that grow with each
            stop's index.
          </>
        }
        code={geoJSONLayerDemoSource}
        demo={<GeoJSONLayerDemo />}
      />

      <DemoSection
        title="Load GeoJSON from a URL"
        description={
          <>
            <code>data</code> also accepts a URL string — the map fetches the
            GeoJSON itself, so large datasets never pass through React. Here
            ~10k earthquakes stream straight from the MapLibre example dataset,
            sized and colored by magnitude.
          </>
        }
        code={geoJSONFromUrlDemoSource}
        demo={<GeoJSONFromUrlDemo />}
      />
      <PropsTable component="Layer" />
      <PropsTable component="LayerControl" />
      <PropsTable component="PointLayer" />
      <PropsTable component="HeatmapLayer" />
      <PropsTable component="ShapeLayer" />
      <PropsTable component="Legend" />
      <PropsTable component="GeoJSONLayer" />
    </Box>
  );
};

export default LayersPage;

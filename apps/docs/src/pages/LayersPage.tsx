import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LayersOutlined from "@mui/icons-material/LayersOutlined";
import Place from "@mui/icons-material/Place";
import Whatshot from "@mui/icons-material/Whatshot";
import Public from "@mui/icons-material/Public";
import type { FeatureCollection } from "geojson";
import {
  Map,
  LayerControl,
  Layer,
  PointLayer,
  HeatmapLayer,
  ShapeLayer,
  Legend,
} from "zmapgl";
import type { ChoroplethSpec } from "zmapgl";
import DemoSection from "../components/DemoSection";
import Styles from "./layersPage.style";
import { clusterPoints } from "../data";

function rect(
  name: string,
  [w, s]: [number, number],
  [e, n]: [number, number],
  value: number,
): FeatureCollection["features"][number] {
  return {
    type: "Feature",
    properties: { name, value },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [w, s],
          [e, s],
          [e, n],
          [w, n],
          [w, s],
        ],
      ],
    },
  };
}

const regions: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    rect("Iberia", [-9, 36], [3, 44], 28),
    rect("France", [-1, 43], [7, 51], 64),
    rect("Central EU", [7, 45], [19, 54], 88),
    rect("British Isles", [-8, 50], [2, 59], 45),
  ],
};

// One spec drives both the choropleth fill and the <Legend> below it, so the
// swatches can never drift from the colors actually painted on the map.
const salesSpec: ChoroplethSpec = {
  property: "value",
  type: "interpolate",
  stops: [
    [0, "info.light"],
    [50, "warning.main"],
    [100, "error.main"],
  ],
};

const code = `import type { FC } from "react";
import LayersOutlined from "@mui/icons-material/LayersOutlined";
import Place from "@mui/icons-material/Place";
import Whatshot from "@mui/icons-material/Whatshot";
import Public from "@mui/icons-material/Public";
import {
  Map, LayerControl, Layer, PointLayer, HeatmapLayer, ShapeLayer,
} from "zmapgl";

const MyMap: FC = () => {
  return (
    <Map center={[8, 46]} zoom={3.5}>
      {/* custom icon + theme-tinted checkboxes; also: renderItem, renderTrigger, sx, slotProps */}
      <LayerControl position="top-right" defaultOpen icon={<LayersOutlined />} colorCheckbox />

      <Layer id="points" label="Locations" icon={<Place />} color="primary.main" group="Overlays">
        <PointLayer points={points} color="primary.main" />
      </Layer>

      <Layer id="heat" label="Density" icon={<Whatshot />} group="Overlays">
        <HeatmapLayer points={points} />
      </Layer>

      <Layer id="regions" label="Sales by region" icon={<Public />} color="secondary.main" group="Overlays" defaultVisible={false}>
        <ShapeLayer
          data={regions}
          fillColor={{ property: "value", type: "interpolate",
                       stops: [[0, "info.light"], [50, "warning.main"], [100, "error.main"]] }}
          lineColor="secondary.main"
        />
      </Layer>
    </Map>
  );
};

export default MyMap;`;

const legendCode = `import type { FC } from "react";
import { Map, ShapeLayer, Legend } from "zmapgl";
import type { ChoroplethSpec } from "zmapgl";

// One spec → both the fill and the legend. They can't drift apart.
const sales: ChoroplethSpec = {
  property: "value",
  type: "interpolate", // or "step" for banded swatches
  stops: [
    [0, "info.light"],
    [50, "warning.main"],
    [100, "error.main"],
  ],
};

const MyMap: FC = () => {
  return (
    <Map center={[6, 46]} zoom={3.4}>
      <ShapeLayer data={regions} fillColor={sales} lineColor="secondary.main" fillOpacity={0.55} />

      {/* spec-driven ramp; also: items={[{ color, label }]} for a categorical key */}
      <Legend title="Sales by region" spec={sales} position="bottom-right" formatValue={(v) => \`$\${v}M\`} />
    </Map>
  );
};

export default MyMap;`;

export const LayersPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Layers
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        Wrap any map content in a <code>&lt;Layer&gt;</code> and drop in a{" "}
        <code>&lt;LayerControl&gt;</code> to get a checkbox panel that toggles
        each overlay. A layer can be anything — points, a heatmap, GeoJSON
        shapes (here with a data-driven choropleth fill), clusters, routes. Open
        the panel (top-right) and toggle the overlays.
      </Typography>

      <DemoSection
        title="Toggleable overlays"
        description="Points, a density heatmap, and choropleth regions — each its own layer."
        code={code}
        demo={
          <Map center={[6, 46]} zoom={3.4} sx={Styles.map}>
            <LayerControl
              position="top-right"
              defaultOpen
              icon={<LayersOutlined fontSize="small" />}
              colorCheckbox
            />

            <Layer
              id="points"
              label="Locations"
              color="primary.main"
              icon={<Place fontSize="small" color="primary" />}
              group="Overlays"
            >
              <PointLayer
                points={clusterPoints}
                color="primary.main"
                radius={4}
              />
            </Layer>

            <Layer
              id="heat"
              label="Density heatmap"
              icon={<Whatshot fontSize="small" color="error" />}
              group="Overlays"
            >
              <HeatmapLayer points={clusterPoints} radius={26} />
            </Layer>

            <Layer
              id="regions"
              label="Sales by region"
              color="secondary.main"
              icon={<Public fontSize="small" color="secondary" />}
              group="Overlays"
              defaultVisible={false}
            >
              <ShapeLayer
                data={regions}
                fillColor={salesSpec}
                lineColor="secondary.main"
                fillOpacity={0.45}
              />
            </Layer>
          </Map>
        }
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
        code={legendCode}
        demo={
          <Map center={[6, 46]} zoom={3.4} sx={Styles.map}>
            <ShapeLayer
              data={regions}
              fillColor={salesSpec}
              lineColor="secondary.main"
              fillOpacity={0.55}
            />
            <Legend
              title="Sales by region"
              spec={salesSpec}
              position="bottom-right"
              formatValue={(v) => `$${v}M`}
            />
          </Map>
        }
      />
    </Box>
  );
};

import type { FC } from "react";
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
} from "zmapgl";
import type { ChoroplethSpec } from "zmapgl";
import { clusterPoints } from "../../data";

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

const salesSpec: ChoroplethSpec = {
  property: "value",
  type: "interpolate",
  stops: [
    [0, "info.light"],
    [50, "warning.main"],
    [100, "error.main"],
  ],
};

const LayerControlDemo: FC = () => {
  return (
    <Map center={[6, 46]} zoom={3.4} sx={{ height: 480, borderRadius: 2 }}>
      {/* custom icon + theme-tinted checkboxes;
          also: renderItem, renderTrigger, sx, slotProps */}
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
        <PointLayer points={clusterPoints} color="primary.main" radius={4} />
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
  );
};

export default LayerControlDemo;

import type { FC } from "react";
import LayersOutlined from "@mui/icons-material/LayersOutlined";
import Place from "@mui/icons-material/Place";
import Whatshot from "@mui/icons-material/Whatshot";
import Public from "@mui/icons-material/Public";
import {
  Map,
  LayerControl,
  Layer,
  PointLayer,
  HeatmapLayer,
  ShapeLayer,
} from "zmapgl";
import type { ChoroplethSpec } from "zmapgl";
import { clusterPoints, europeSales } from "../../data";

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
        <PointLayer
          points={clusterPoints}
          fillColor="primary.main"
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
          data={europeSales}
          fillColor={salesSpec}
          strokeColor="secondary.main"
          strokeWidth={0.75}
          fillOpacity={0.45}
        />
      </Layer>
    </Map>
  );
};

export default LayerControlDemo;

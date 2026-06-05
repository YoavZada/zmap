import { useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import {
  GeoJSONLayer,
  featureCollection,
  lineFeature,
  pointFeature,
  type LayerInput,
} from "zmap";
import type { RoadNetwork } from "../lib/types";

export type NetworkLayerProps = {
  network: RoadNetwork;
};

/**
 * Draws the routable graph beneath everything else: faint lines for road
 * segments and small dots for intersections. Lines and points share one source
 * — a line layer only renders LineStrings, a circle layer only renders Points.
 */
const NetworkLayer: FC<NetworkLayerProps> = ({ network }) => {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";

  const data = useMemo(() => {
    const segments = network.edges.map((e) =>
      lineFeature([
        [network.nodes[e.a].lng, network.nodes[e.a].lat],
        [network.nodes[e.b].lng, network.nodes[e.b].lat],
      ]),
    );
    const intersections = network.nodes.map((node) =>
      pointFeature([node.lng, node.lat]),
    );
    return featureCollection([...segments, ...intersections]);
  }, [network]);

  const lineColor = dark ? theme.palette.grey[600] : theme.palette.grey[400];
  const dotColor = dark ? theme.palette.grey[500] : theme.palette.grey[500];

  const layers = useMemo<LayerInput[]>(
    () => [
      {
        id: "network-segments",
        type: "line",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": lineColor,
          "line-width": 1.5,
          "line-opacity": 0.5,
        },
      },
      {
        id: "network-nodes",
        type: "circle",
        paint: {
          "circle-radius": 2.4,
          "circle-color": dotColor,
          "circle-opacity": 0.55,
        },
      },
    ],
    [lineColor, dotColor],
  );

  return <GeoJSONLayer id="pf-network" data={data} layers={layers} />;
};

export default NetworkLayer;

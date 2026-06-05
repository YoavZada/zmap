import { useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import {
  GeoJSONLayer,
  featureCollection,
  lineFeature,
  type LayerInput,
} from "zmap";
import type { RoadNetwork, SettleStep } from "../lib/types";

export type SearchTreeLayerProps = {
  network: RoadNetwork;
  settled: SettleStep[];
  /** Reveal only the first `visible` settled nodes (the search wavefront). */
  visible: number;
};

/**
 * Visualizes Dijkstra's progress: the shortest-path tree edges to every node
 * settled so far. As `visible` grows the tree expands outward from the source.
 */
const SearchTreeLayer: FC<SearchTreeLayerProps> = ({
  network,
  settled,
  visible,
}) => {
  const theme = useTheme();

  const data = useMemo(() => {
    const count = Math.min(visible, settled.length);
    const features = [];
    for (let i = 0; i < count; i++) {
      const step = settled[i];
      if (step.from < 0) continue;
      const a = network.nodes[step.from];
      const b = network.nodes[step.node];
      features.push(
        lineFeature([
          [a.lng, a.lat],
          [b.lng, b.lat],
        ]),
      );
    }
    return featureCollection(features);
  }, [network, settled, visible]);

  const color = theme.palette.secondary.main;

  const layers = useMemo<LayerInput[]>(
    () => [
      {
        id: "search-tree-line",
        type: "line",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": color,
          "line-width": 2.5,
          "line-opacity": 0.7,
        },
      },
    ],
    [color],
  );

  return <GeoJSONLayer id="pf-search-tree" data={data} layers={layers} />;
};

export default SearchTreeLayer;

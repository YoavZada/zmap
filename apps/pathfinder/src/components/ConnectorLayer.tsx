import { useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import {
  GeoJSONLayer,
  featureCollection,
  lineFeature,
  type LayerInput,
  type LngLatTuple,
} from "zmapgl";
import type { RoutePoint } from "../lib/types";

export type ConnectorLayerProps = {
  points: RoutePoint[];
  /** Where each point snaps onto the street network, by input index. */
  snapped: LngLatTuple[];
};

/**
 * Faint dashed links from each dropped point to the spot where it joins the
 * street network. They make the off-street "last leg" visible — it isn't part
 * of the route and doesn't count toward the distance.
 */
const ConnectorLayer: FC<ConnectorLayerProps> = ({ points, snapped }) => {
  const theme = useTheme();

  const data = useMemo(
    () =>
      featureCollection(
        points.map((p, i) => lineFeature([[p.lng, p.lat], snapped[i]])),
      ),
    [points, snapped],
  );

  const color = theme.palette.text.secondary;

  const layers = useMemo<LayerInput[]>(
    () => [
      {
        id: "pf-connector-line",
        type: "line",
        layout: { "line-cap": "round" },
        paint: {
          "line-color": color,
          "line-width": 1.5,
          "line-dasharray": [1.5, 1.5],
          "line-opacity": 0.7,
        },
      },
    ],
    [color],
  );

  return <GeoJSONLayer id="pf-connectors" data={data} layers={layers} />;
};

export default ConnectorLayer;

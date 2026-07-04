import type { FC } from "react";
import type { FeatureCollection } from "geojson";
import { Map, GeoJSONLayer } from "zmapgl";
import type { LayerInput } from "zmapgl";
import { londonRoute } from "../../data";

// One collection: the walking route as a LineString, plus each stop as a
// Point carrying its 1-based index.
const walk: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: londonRoute },
    },
    ...londonRoute.map((coordinates, i) => ({
      type: "Feature" as const,
      properties: { stop: i + 1 },
      geometry: { type: "Point" as const, coordinates },
    })),
  ],
};

// Raw MapLibre layer specs — any layer type, full paint/layout control,
// filters, and data-driven expressions. `source` is filled in from the id.
const layers: LayerInput[] = [
  {
    id: "walk-line",
    type: "line",
    filter: ["==", ["geometry-type"], "LineString"],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#7c4dff",
      "line-width": 4,
      "line-dasharray": [0.2, 2],
    },
  },
  {
    id: "walk-stops",
    type: "circle",
    filter: ["has", "stop"],
    paint: {
      // Circles grow along the route: radius driven by the "stop" property.
      "circle-radius": ["+", 3, ["get", "stop"]],
      "circle-color": "#7c4dff",
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1.5,
    },
  },
];

const GeoJSONLayerDemo: FC = () => {
  return (
    <Map
      center={[-0.11, 51.505]}
      zoom={12.2}
      sx={{ height: 480, borderRadius: 2 }}
    >
      <GeoJSONLayer id="walk" data={walk} layers={layers} />
    </Map>
  );
};

export default GeoJSONLayerDemo;

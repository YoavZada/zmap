import type { FC } from "react";
import { Map, GeoJSONLayer } from "zmapgl";
import type { LayerInput } from "zmapgl";

// `data` can be a URL string — the map fetches the GeoJSON itself.
// ~10k earthquakes from the MapLibre example dataset.
const EARTHQUAKES =
  "https://maplibre.org/maplibre-gl-js/docs/assets/earthquakes.geojson";

const layers: LayerInput[] = [
  {
    id: "quakes-circles",
    type: "circle",
    paint: {
      // Radius and color scale with magnitude.
      "circle-radius": ["interpolate", ["linear"], ["get", "mag"], 1, 2, 6, 9],
      "circle-color": [
        "interpolate",
        ["linear"],
        ["get", "mag"],
        1,
        "#7c4dff",
        6,
        "#ff1744",
      ],
      "circle-opacity": 0.6,
    },
  },
];

const GeoJSONFromUrlDemo: FC = () => {
  return (
    <Map center={[-150, 45]} zoom={1.8} sx={{ height: 440, borderRadius: 2 }}>
      <GeoJSONLayer id="quakes" data={EARTHQUAKES} layers={layers} />
    </Map>
  );
};

export default GeoJSONFromUrlDemo;

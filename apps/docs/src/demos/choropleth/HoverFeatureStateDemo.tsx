import type { FC } from "react";
import Chip from "@mui/material/Chip";
import { Map, GeoJSONLayer, useFeatureState } from "zmapgl";
import type { LayerInput } from "zmapgl";
import { usStates } from "../../data";

// Paint reacts per feature through feature-state: hovered polygons brighten.
const layers: LayerInput[] = [
  {
    id: "states-fill",
    type: "fill",
    paint: {
      "fill-color": "#7c4dff",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.65,
        0.25,
      ],
    },
  },
  {
    id: "states-line",
    type: "line",
    paint: { "line-color": "#7c4dff", "line-width": 1 },
  },
];

// useFeatureState needs feature ids — generateId assigns them.
const sourceOptions = { generateId: true };

// Rendered under <Map>, so the hook can reach the map through context.
const HoverReadout: FC = () => {
  const hovered = useFeatureState({ layer: "states-fill", source: "states" });
  return (
    <Chip
      sx={{
        position: "absolute",
        bottom: 12,
        left: 12,
        zIndex: 2,
        bgcolor: "background.paper",
      }}
      variant="outlined"
      color={hovered ? "secondary" : "default"}
      label={
        hovered
          ? `${hovered.properties.name} — ${hovered.properties.value} people/mi²`
          : "Hover a state"
      }
    />
  );
};

const HoverFeatureStateDemo: FC = () => {
  return (
    <Map center={[-98, 38.5]} zoom={3.2} sx={{ height: 440, borderRadius: 2 }}>
      <GeoJSONLayer
        id="states"
        data={usStates}
        sourceOptions={sourceOptions}
        layers={layers}
      />
      <HoverReadout />
    </Map>
  );
};

export default HoverFeatureStateDemo;

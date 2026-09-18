import { useState, type FC } from "react";
import Chip from "@mui/material/Chip";
import { Map, ShapeLayer } from "zmapgl";
import type { MapGeoJSONFeature } from "maplibre-gl";
import { usStates } from "../../data";

// hoverHighlight mirrors hover into feature-state under the hood (the same
// mechanism the low-level useFeatureState hook exposes directly) and wraps
// fill-opacity/line-color in a feature-state case for us — no hand-rolled
// paint expression or generateId needed.
const HoverFeatureStateDemo: FC = () => {
  const [hovered, setHovered] = useState<MapGeoJSONFeature | null>(null);

  return (
    <Map center={[-98, 38.5]} zoom={3.2} sx={{ height: 440, borderRadius: 2 }}>
      <ShapeLayer
        id="states"
        data={usStates}
        fillColor="#7c4dff"
        fillOpacity={0.25}
        strokeColor="#7c4dff"
        strokeWidth={1}
        onHover={setHovered}
        hoverHighlight={{ fillOpacity: 0.65, strokeColor: "#7c4dff" }}
      />
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
            ? `${hovered.properties?.name} — ${hovered.properties?.value} people/mi²`
            : "Hover a state"
        }
      />
    </Map>
  );
};

export default HoverFeatureStateDemo;

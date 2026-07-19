import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Map, Arc, Marker, SymbolLayer } from "zmapgl";

// --- demo data ---
const airports = {
  LHR: { label: "London", longitude: -0.4543, latitude: 51.47 },
  JFK: { label: "New York", longitude: -73.7781, latitude: 40.6413 },
  SIN: { label: "Singapore", longitude: 103.9915, latitude: 1.3644 },
  DXB: { label: "Dubai", longitude: 55.3657, latitude: 25.2532 },
  GRU: { label: "São Paulo", longitude: -46.4731, latitude: -23.4356 },
  NRT: { label: "Tokyo", longitude: 140.3929, latitude: 35.772 },
  SYD: { label: "Sydney", longitude: 151.1772, latitude: -33.9399 },
  CPT: { label: "Cape Town", longitude: 18.6021, latitude: -33.9715 },
};
type Code = keyof typeof airports;

const network: Record<Code, Code[]> = {
  LHR: ["JFK", "DXB", "GRU", "CPT", "SIN"],
  JFK: ["LHR", "GRU", "NRT"],
  SIN: ["LHR", "NRT", "SYD", "DXB"],
  DXB: ["LHR", "SIN", "CPT", "SYD"],
  GRU: ["LHR", "JFK", "CPT"],
  NRT: ["JFK", "SIN", "SYD"],
  SYD: ["SIN", "DXB", "NRT"],
  CPT: ["LHR", "DXB", "GRU"],
};
const HUBS: Code[] = ["LHR", "JFK", "SIN", "DXB"];

const labelPoints = Object.entries(airports).map(([code, a]) => ({
  longitude: a.longitude,
  latitude: a.latitude,
  label: code,
}));

/**
 * Flight network: geodesic arcs out of a switchable hub, with GPU symbol
 * labels for every airport and a marker on the active hub.
 */
const FlightNetworkBlock: FC = () => {
  const [hub, setHub] = useState<Code>("LHR");
  const origin = airports[hub];

  return (
    <Box sx={{ position: "relative", height: 560 }}>
      <Map center={[10, 22]} zoom={1.3} sx={{ height: "100%", borderRadius: 2 }}>
        {network[hub].map((dest) => (
          <Arc
            key={`${hub}-${dest}`}
            from={[origin.longitude, origin.latitude]}
            to={[airports[dest].longitude, airports[dest].latitude]}
            type="geodesic"
            color="secondary.main"
            width={2}
            opacity={0.85}
          />
        ))}
        <SymbolLayer
          points={labelPoints}
          color="text.primary"
          size={11}
          anchor="top"
          allowOverlap
        />
        <Marker longitude={origin.longitude} latitude={origin.latitude}>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              bgcolor: "secondary.main",
              border: 3,
              borderColor: "background.paper",
              boxShadow: 2,
            }}
          />
        </Marker>
      </Map>

      {/* Hub switcher */}
      <Paper elevation={4} sx={{ position: "absolute", top: 16, left: 16, borderRadius: 2 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={hub}
          onChange={(_, next) => next && setHub(next)}
        >
          {HUBS.map((code) => (
            <ToggleButton key={code} value={code} sx={{ px: 1.5 }}>
              {code}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>
    </Box>
  );
};

export default FlightNetworkBlock;

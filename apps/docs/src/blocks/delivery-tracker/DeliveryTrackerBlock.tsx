import "zmapgl/styles.css";
import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Map, Marker, Route, TimePlayback, type LngLatTuple } from "zmapgl";
import type { FeatureCollection } from "geojson";

// --- demo data ---
// The planned route through lower Manhattan, south to north.
const path: LngLatTuple[] = [
  [-74.0136, 40.7051],
  [-74.009, 40.7093],
  [-74.0065, 40.7135],
  [-74.0043, 40.7182],
  [-74.0031, 40.7228],
  [-73.9998, 40.7268],
  [-73.9969, 40.7311],
  [-73.9954, 40.7357],
  [-73.9932, 40.7402],
  [-73.9905, 40.7448],
  [-73.9884, 40.7495],
  [-73.9857, 40.754],
];

// The courier's pings: interpolated along the path, one per minute.
const PINGS_PER_LEG = 5;
const trip: FeatureCollection = {
  type: "FeatureCollection",
  features: path.slice(0, -1).flatMap(([lng, lat], leg) => {
    const [nextLng, nextLat] = path[leg + 1];
    return Array.from({ length: PINGS_PER_LEG }, (_, s) => {
      const t = s / PINGS_PER_LEG;
      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [lng + (nextLng - lng) * t, lat + (nextLat - lat) * t],
        },
        properties: { time: leg * PINGS_PER_LEG + s },
      };
    });
  }),
};
const TOTAL = (path.length - 1) * PINGS_PER_LEG - 1;

/**
 * Delivery tracker: the planned route, an animated courier trail on top of
 * it, and a status card fed by the playhead.
 */
const DeliveryTrackerBlock: FC = () => {
  const [progress, setProgress] = useState(0);

  return (
    <Box sx={{ position: "relative", height: 560 }}>
      <Map
        center={[-74.0, 40.729]}
        zoom={12.2}
        sx={{ height: "100%", borderRadius: 2 }}
      >
        {/* Planned path, faint under the live trail. */}
        <Route
          coordinates={path}
          color="primary.main"
          width={5}
          opacity={0.35}
        />
        <TimePlayback
          data={trip}
          trail={10}
          color="secondary.main"
          radius={7}
          duration={10}
          autoplay
          position="bottom-right"
          formatTime={(t) => `${Math.round(t)} min`}
          onTimeChange={(t) => setProgress(Math.round((t / TOTAL) * 100))}
        />
        <Marker longitude={path[0][0]} latitude={path[0][1]} label="Depot" />
        <Marker
          longitude={path[path.length - 1][0]}
          latitude={path[path.length - 1][1]}
          label="Destination"
        />
      </Map>

      {/* Status card */}
      <Paper
        elevation={4}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          px: 2.5,
          py: 1.5,
          width: 220,
          borderRadius: 2,
        }}
      >
        <Typography variant="overline" color="text.secondary">
          Order #4817
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          {progress >= 100 ? "Delivered" : "En route"} —{" "}
          {Math.min(progress, 100)}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          sx={{ borderRadius: 1 }}
        />
      </Paper>
    </Box>
  );
};

export default DeliveryTrackerBlock;

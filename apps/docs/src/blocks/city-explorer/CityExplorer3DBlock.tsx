import "zmapgl/styles.css";
import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
  Map,
  MapControls,
  ExtrusionLayer,
  Legend,
  type ChoroplethSpec,
} from "zmapgl";
import type { Feature, FeatureCollection, Polygon } from "geojson";

// --- demo data ---
// A deterministic grid of downtown blocks; height rises toward the center.
const CENTER: [number, number] = [-87.632, 41.881]; // Chicago Loop
const SIZE = 0.0016; // footprint edge, ~150 m

const buildings: FeatureCollection<Polygon> = {
  type: "FeatureCollection",
  features: Array.from({ length: 49 }, (_, k): Feature<Polygon> => {
    const i = (k % 7) - 3;
    const j = Math.floor(k / 7) - 3;
    const lng = CENTER[0] + i * SIZE * 1.7;
    const lat = CENTER[1] + j * SIZE * 1.35;
    // Tallest at the core, stepping down outward — plus a pseudo-random wobble.
    const ring = Math.max(Math.abs(i), Math.abs(j));
    const wobble = ((k * 37) % 23) * 6;
    const height = 320 - ring * 80 + wobble;
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lng, lat],
            [lng + SIZE, lat],
            [lng + SIZE, lat + SIZE * 0.75],
            [lng, lat + SIZE * 0.75],
            [lng, lat],
          ],
        ],
      },
      properties: {
        height,
        block: `${String.fromCharCode(65 + j + 3)}${i + 4}`,
      },
    };
  }),
};

const byHeight: ChoroplethSpec = {
  property: "height",
  stops: [
    [40, "grey.500"],
    [160, "primary.light"],
    [280, "primary.main"],
    [400, "secondary.main"],
  ],
};

/**
 * City explorer: click a tower to inspect it. Heights and colors are driven
 * by the same data property; the pitch control drops the camera into 3D.
 */
const CityExplorer3DBlock: FC = () => {
  const [picked, setPicked] = useState<{
    block: string;
    height: number;
  } | null>(null);

  return (
    <Box sx={{ position: "relative", height: 560 }}>
      <Map
        center={CENTER}
        zoom={14.1}
        initialView={{ pitch: 58, bearing: -25 }}
        sx={{ height: "100%", borderRadius: 2 }}
      >
        <MapControls position="top-right" showPitch />
        <ExtrusionLayer
          data={buildings}
          heightProperty="height"
          fillColor={byHeight}
          fillOpacity={0.92}
          onClick={(feature) =>
            setPicked({
              block: String(feature.properties?.block),
              height: Number(feature.properties?.height),
            })
          }
        />
        <Legend
          title="Building height"
          spec={byHeight}
          formatValue={(v) => `${v} m`}
        />
      </Map>

      {/* Inspector */}
      <Paper
        elevation={4}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          px: 2.5,
          py: 1.5,
          borderRadius: 2,
          minWidth: 170,
        }}
      >
        <Typography variant="overline" color="text.secondary">
          {picked ? `Block ${picked.block}` : "Click a building"}
        </Typography>
        <Typography variant="h6">
          {picked ? `${Math.round(picked.height)} m` : "—"}
        </Typography>
      </Paper>
    </Box>
  );
};

export default CityExplorer3DBlock;

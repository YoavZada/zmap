import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
  Map,
  ChoroplethLayer,
  PointLayer,
  Layer,
  LayerControl,
} from "zmapgl";
import type { Feature, FeatureCollection, Polygon } from "geojson";

// --- demo data ---
// Rectangular sales territories over the central US, revenue in $k.
const box = (
  name: string,
  lng: number,
  lat: number,
  value: number,
): Feature<Polygon> => ({
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [lng, lat],
        [lng + 7, lat],
        [lng + 7, lat + 5],
        [lng, lat + 5],
        [lng, lat],
      ],
    ],
  },
  properties: { name, value },
});

const territories: FeatureCollection<Polygon> = {
  type: "FeatureCollection",
  features: [
    box("Northwest", -111, 42, 320),
    box("North", -104, 42, 545),
    box("Northeast", -97, 42, 480),
    box("West", -111, 37, 150),
    box("Central", -104, 37, 720),
    box("East", -97, 37, 610),
    box("Southwest", -111, 32, 260),
    box("South", -104, 32, 430),
    box("Southeast", -97, 32, 380),
  ],
};

const offices = [
  { longitude: -105.0, latitude: 39.7, properties: { city: "Denver" } },
  { longitude: -97.5, latitude: 35.5, properties: { city: "OKC" } },
  { longitude: -98.5, latitude: 39.1, properties: { city: "Salina" } },
  { longitude: -106.6, latitude: 35.1, properties: { city: "ABQ" } },
  { longitude: -96.8, latitude: 43.5, properties: { city: "Sioux Falls" } },
];

const total = territories.features.reduce(
  (sum, f) => sum + (f.properties?.value as number),
  0,
);

/**
 * Analytics dashboard: a choropleth with a shared-spec legend, toggleable
 * overlays, and a KPI strip that reacts to clicks on the map.
 */
const RegionalAnalyticsBlock: FC = () => {
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <Box sx={{ position: "relative", height: 560 }}>
      <Map center={[-103.5, 39.5]} zoom={4.1} sx={{ height: "100%", borderRadius: 2 }}>
        <Layer id="revenue" label="Revenue by territory" color="primary.main">
          <ChoroplethLayer
            data={territories}
            property="value"
            stops={[
              [100, "info.light"],
              [350, "primary.light"],
              [550, "primary.main"],
              [750, "secondary.main"],
            ]}
            fillOpacity={0.55}
            onClick={(feature) => setFocused(feature.properties?.name ?? null)}
            legend={{
              title: "Revenue",
              formatValue: (v) => `$${v}k`,
            }}
          />
        </Layer>
        <Layer id="offices" label="Offices" color="secondary.main">
          <PointLayer
            points={offices}
            fillColor="secondary.main"
            radius={5}
            strokeWidth={2}
          />
        </Layer>
        <LayerControl position="top-right" title="Overlays" />
      </Map>

      {/* KPI strip */}
      <Paper
        elevation={4}
        sx={{ position: "absolute", top: 16, left: 16, px: 2.5, py: 1.5, borderRadius: 2, display: "flex", gap: 4 }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary">
            Total revenue
          </Typography>
          <Typography variant="h6">${total}k</Typography>
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Offices
          </Typography>
          <Typography variant="h6">{offices.length}</Typography>
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Focused
          </Typography>
          <Typography variant="h6">{focused ?? "—"}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegionalAnalyticsBlock;

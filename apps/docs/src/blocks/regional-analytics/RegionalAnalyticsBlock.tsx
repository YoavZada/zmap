import "zmapgl/styles.css";
import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Map, ChoroplethLayer, PointLayer, Layer, LayerControl } from "zmapgl";
// Real country borders are too large to inline — the app bundles them (see
// src/geo + scripts/gen-geo.mjs). In your own app, import a countries GeoJSON
// the same way; every feature here carries a numeric "value" (visitors, in k).
import { worldCountries } from "../../data";

// Top markets as points, for the toggleable overlay — inline lng/lat.
const markets = [
  { longitude: -74.006, latitude: 40.7128, properties: { city: "New York" } },
  { longitude: -0.1276, latitude: 51.5072, properties: { city: "London" } },
  { longitude: 77.5946, latitude: 12.9716, properties: { city: "Bengaluru" } },
  {
    longitude: -46.6333,
    latitude: -23.5505,
    properties: { city: "São Paulo" },
  },
  { longitude: 13.405, latitude: 52.52, properties: { city: "Berlin" } },
  { longitude: 151.2093, latitude: -33.8688, properties: { city: "Sydney" } },
];

const totalVisitors = worldCountries.features.reduce(
  (sum, f) => sum + (f.properties?.value as number),
  0,
);
const fmt = (k: number) =>
  k >= 1000 ? `${(k / 1000).toFixed(1)}M` : `${Math.round(k)}k`;

/**
 * Analytics dashboard: a world choropleth of visitors by country with a
 * shared-spec legend, a toggleable top-markets overlay, and a KPI strip that
 * reacts to clicks on the map.
 */
const RegionalAnalyticsBlock: FC = () => {
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <Box sx={{ position: "relative", height: 560 }}>
      <Map
        center={[10, 28]}
        zoom={1.15}
        sx={{ height: "100%", borderRadius: 2 }}
      >
        <Layer id="visitors" label="Visitors by country" color="primary.main">
          <ChoroplethLayer
            data={worldCountries}
            property="value"
            // The brand indigo→pink gradient as a ramp: pale indigo where
            // traffic is thin, hot pink where it's heavy. Both ends are
            // saturated palette *mains*, so it reads in light and dark alike
            // (a single-hue ramp inverts on the near-black dark basemap).
            stops={[
              [0, "primary.light"],
              [50, "primary.main"],
              [100, "secondary.main"],
            ]}
            fillOpacity={0.72}
            strokeColor="divider"
            strokeWidth={0.5}
            onClick={(feature) => setFocused(feature.properties?.name ?? null)}
            legend={{
              title: "Visitors by country",
              position: "bottom-left",
              formatValue: (v) => `${v}k`,
            }}
          />
        </Layer>
        <Layer id="markets" label="Top markets" color="secondary.main">
          <PointLayer
            points={markets}
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
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          px: 2.5,
          py: 1.5,
          borderRadius: 2,
          display: "flex",
          gap: 4,
        }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary">
            Total visitors
          </Typography>
          <Typography variant="h6">{fmt(totalVisitors)}</Typography>
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Countries
          </Typography>
          <Typography variant="h6">{worldCountries.features.length}</Typography>
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

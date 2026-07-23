import type { FC } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import CodeBlock from "../../components/CodeBlock";
import PageHeader from "../../components/PageHeader";
import Styles from "./reactMapGlGuidePage.style";

type MappingRow = { rmg: string; zmap: string; note: string };

const mappings: MappingRow[] = [
  {
    rmg: "<Map mapLib={maplibregl} mapStyle={…}>",
    zmap: '<Map provider="carto">',
    note: "No mapLib prop; providers are built in (carto, osm, …) or pass any style URL/spec.",
  },
  {
    rmg: "viewState + onMove (controlled spreading)",
    zmap: "center/zoom + view + onMove/onMoveEnd",
    note: "Uncontrolled-first: set the initial camera via center/zoom (or initialView); subscribe with onMove/onMoveEnd. Controlled mode is available via the view prop.",
  },
  {
    rmg: "<Marker> / <Popup>",
    zmap: "<Marker> / <Popup> / <Tooltip>",
    note: "Same idea, MUI-native: children are arbitrary MUI content portaled in, so they inherit the app theme automatically.",
  },
  {
    rmg: "<Source> + <Layer> pairs",
    zmap: "<GeoJSONLayer> / <PointLayer> / <ShapeLayer> / <HeatmapLayer> / …",
    note: "Purpose-built layer components with a unified fill/stroke prop vocabulary; GeoJSONLayer is the raw escape hatch.",
  },
  {
    rmg: "<NavigationControl /> etc.",
    zmap: '<MapControls position="top-right" />',
    note: "One themed cluster: zoom, compass, geolocate, fullscreen, scale.",
  },
  {
    rmg: "useMap()",
    zmap: "useMap()",
    note: "Same name; returns the raw MapLibre instance (null until ready). For load state too, useMapContext() returns { map, loaded }.",
  },
  {
    rmg: "Custom clustering (Source props + expressions)",
    zmap: "<Cluster points={…}> with an MUI renderer",
    note: "Native clustering rendered as themed MUI bubbles.",
  },
];

const beforeAfter = `// react-map-gl
<Map
  mapLib={maplibregl}
  initialViewState={{ longitude: -0.1276, latitude: 51.5072, zoom: 11 }}
  mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
>
  <Marker longitude={-0.1276} latitude={51.5072} />
</Map>

// zmapgl — theme-aware basemap, MUI marker, no boilerplate
<Map center={[-0.1276, 51.5072]} zoom={11} sx={{ height: 420 }}>
  <Marker longitude={-0.1276} latitude={51.5072} />
</Map>`;

const honestGaps = [
  "No drape/terrain or globe projection props yet (planned).",
  "No <Source> primitive — data flows through the layer components (GeoJSONLayer covers raw sources + layers).",
  "react-map-gl's controlled viewState idiom exists but uncontrolled-first is the default here.",
];

const ReactMapGlGuidePage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Migrating from react-map-gl"
        lead="The concepts carry over one-to-one; what changes is that everything renders through MUI and follows your theme."
      />

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Concept map
        </Typography>
        <Table sx={Styles.table}>
          <TableHead>
            <TableRow>
              <TableCell>react-map-gl</TableCell>
              <TableCell>zmapgl</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mappings.map((row) => (
              <TableRow key={row.rmg}>
                <TableCell>
                  <code>{row.rmg}</code>
                </TableCell>
                <TableCell>
                  <code>{row.zmap}</code>
                </TableCell>
                <TableCell>{row.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Before / after
        </Typography>
        <CodeBlock code={beforeAfter} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          What you gain
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Automatic light/dark basemaps that follow your MUI theme, palette
          tokens as color props (<code>color=&quot;primary.main&quot;</code>),
          themed controls/popups/clusters out of the box, and zero-config
          providers — no token, no style URL to start.
        </Typography>
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Honest differences
        </Typography>
        <Box component="ul" sx={Styles.sectionLead}>
          {honestGaps.map((gap) => (
            <Typography key={gap} component="li" color="text.secondary">
              {gap}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ReactMapGlGuidePage;

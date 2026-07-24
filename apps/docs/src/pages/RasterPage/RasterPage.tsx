import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CodeBlock from "../../components/CodeBlock";
import DemoSection from "../../components/DemoSection";
import PageHeader from "../../components/PageHeader";
import PropsTable from "../../components/PropsTable";
import RasterTiles from "../../demos/raster/RasterTiles";
import rasterTilesSource from "../../demos/raster/RasterTiles.tsx?raw";

const PMTILES_SNIPPET = `import { Map, registerPmtilesProtocol } from "zmapgl";

// Call once at startup (or let <Map> auto-register when it sees a
// pmtiles:// URL in your provider style):
await registerPmtilesProtocol();

<Map
  provider={{
    version: 8,
    sources: {
      example: { type: "vector", url: "pmtiles://https://example.com/tiles.pmtiles" },
    },
    layers: [/* ... */],
  }}
/>;`;

const RasterPage: FC = () => (
  <Box>
    <PageHeader
      title="Raster & PMTiles"
      lead={
        <>
          Add XYZ or WMS raster tiles with <code>&lt;RasterLayer&gt;</code>, and
          read <code>.pmtiles</code> archives via a one-line protocol
          registration.
        </>
      }
    />
    <DemoSection
      title="Raster tiles"
      description="A RasterLayer over the basemap — any XYZ/WMS tile endpoint, with adjustable opacity and layer order."
      code={rasterTilesSource}
      demo={<RasterTiles />}
    />
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        PMTiles
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Register the <code>pmtiles://</code> protocol once; zmapgl loads the
        pmtiles decoder lazily.
      </Typography>
      <CodeBlock code={PMTILES_SNIPPET} language="tsx" />
    </Box>
    <PropsTable component="RasterLayer" />
  </Box>
);

export default RasterPage;

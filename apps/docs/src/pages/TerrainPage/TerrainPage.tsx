import type { FC } from "react";
import Box from "@mui/material/Box";
import DemoSection from "../../components/DemoSection";
import PageHeader from "../../components/PageHeader";
import PropsTable from "../../components/PropsTable";
import GlobeTerrain from "../../demos/terrain/GlobeTerrain";
import globeTerrainSource from "../../demos/terrain/GlobeTerrain.tsx?raw";

const TerrainPage: FC = () => (
  <Box>
    <PageHeader
      title="Globe & terrain"
      lead={
        <>
          Render the world as a 3D globe with <code>projection="globe"</code> on{" "}
          <code>&lt;Map&gt;</code>, and drape the basemap over real elevation
          with <code>&lt;Terrain&gt;</code>. Terrain defaults to the free AWS
          Terrarium elevation tileset (fair use; self-host for production) —
          pass <code>demSource</code> to use your own. Elevation data © Mapzen /
          AWS Terrain Tiles.
        </>
      }
    />
    <DemoSection
      title="Globe and 3D terrain"
      description="Toggle globe projection; terrain and sky stay applied across the switch and any theme change."
      code={globeTerrainSource}
      demo={<GlobeTerrain />}
    />
    <PropsTable
      component="Terrain"
      note={
        <>
          Globe projection is the <code>projection</code> prop on{" "}
          <code>&lt;Map&gt;</code>.
        </>
      }
    />
  </Box>
);

export default TerrainPage;

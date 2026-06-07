import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import Chip from "@mui/material/Chip";
import { Map, Cluster, type ClusterPoint } from "zmapgl";
import DemoSection from "../components/DemoSection";
import Styles from "./clustersPage.style";
import { clusterPoints, clusterCityCount } from "../data";

const code = `import type { FC } from "react";
import { Map, Cluster } from "zmapgl";

// points: { longitude, latitude, properties? }[]
const MyMap: FC = () => {
  return (
    <Map center={[10, 45]} zoom={3}>
      <Cluster
        points={points}
        radius={50}
        color="primary.main"
        pointColor="secondary.main"
        onPointClick={(p) => console.log(p)}
      />
    </Map>
  );
};

export default MyMap;

// Custom bubbles — pass renderCluster:
// <Cluster
//   points={points}
//   renderCluster={(count, expand) => (
//     <Badge badgeContent={count} color="primary" onClick={expand} />
//   )}
// />`;

export function ClustersPage() {
  const [radius, setRadius] = useState(50);
  const [selected, setSelected] = useState<ClusterPoint | null>(null);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Clusters
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        <code>Cluster</code> groups nearby points using MapLibre's native
        clustering and renders the bubbles and points as themed MUI markers.
        Click a cluster to zoom in and expand it. This demo plots{" "}
        {clusterPoints.length} points across {clusterCityCount} cities — a dense
        spread over Europe, plus New York and Tokyo.
      </Typography>

      <DemoSection
        title="Native clustering"
        description="Adjust the cluster radius, then click bubbles to drill in. Click a single point to select it."
        code={code}
        demo={
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              alignItems={{ sm: "center" }}
              sx={Styles.controls}
            >
              <Box sx={Styles.sliderBox}>
                <Typography variant="caption" color="text.secondary">
                  Cluster radius: {radius}px
                </Typography>
                <Slider
                  size="small"
                  min={20}
                  max={90}
                  value={radius}
                  onChange={(_, v) => setRadius(v as number)}
                />
              </Box>
              {selected && (
                <Chip
                  label={`Selected: ${selected.longitude.toFixed(
                    2,
                  )}, ${selected.latitude.toFixed(2)}`}
                  onDelete={() => setSelected(null)}
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Stack>

            <Map center={[20, 45]} zoom={2.4} sx={Styles.map}>
              <Cluster
                points={clusterPoints}
                radius={radius}
                color="primary.main"
                pointColor="secondary.main"
                onPointClick={(p) => setSelected(p)}
              />
            </Map>
          </Box>
        }
      />
    </Box>
  );
}

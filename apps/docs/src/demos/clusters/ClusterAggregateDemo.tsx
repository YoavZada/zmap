import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Map, Cluster } from "zmapgl";
import { clusterPoints } from "../../data";

// Give each point a demo "sales" value to aggregate.
const points = clusterPoints.map((p, i) => ({
  ...p,
  properties: { sales: (i % 9) + 1 },
}));

const ClusterAggregateDemo: FC = () => {
  return (
    <Map center={[20, 45]} zoom={2.4} sx={{ height: 440, borderRadius: 2 }}>
      {/* clusterProperties aggregates point properties per cluster;
          the result arrives as renderCluster's third argument */}
      <Cluster
        points={points}
        clusterProperties={{ sales: ["+", ["get", "sales"]] }}
        renderCluster={(count, expand, props) => (
          <Box
            onClick={expand}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 5,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              textAlign: "center",
              cursor: "pointer",
              boxShadow: 3,
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              {count} sites
            </Typography>
            <Typography variant="caption">
              €{props.sales as number}k sales
            </Typography>
          </Box>
        )}
      />
    </Map>
  );
};

export default ClusterAggregateDemo;

import type { FC } from "react";
import Box from "@mui/material/Box";
import DemoSection from "../../components/DemoSection";
import PageHeader from "../../components/PageHeader";
import PropsTable from "../../components/PropsTable";
import ClusterDemo from "../../demos/clusters/ClusterDemo";
import clusterDemoSource from "../../demos/clusters/ClusterDemo.tsx?raw";
import ClusterAggregateDemo from "../../demos/clusters/ClusterAggregateDemo";
import clusterAggregateDemoSource from "../../demos/clusters/ClusterAggregateDemo.tsx?raw";
import { clusterPoints, clusterCityCount } from "../../data";

const ClustersPage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Clusters"
        lead={
          <>
            <code>Cluster</code> groups nearby points using MapLibre's native
            clustering and renders the bubbles and points as themed MUI markers.
            Click a cluster to zoom in and expand it. This demo plots{" "}
            {clusterPoints.length} points across {clusterCityCount} cities — a
            dense spread over Europe, plus New York and Tokyo.
          </>
        }
      />

      <DemoSection
        title="Native clustering"
        description="Adjust the cluster radius, then click bubbles to drill in. Click a single point to select it. The code shown is the demo's actual source."
        code={clusterDemoSource}
        demo={<ClusterDemo />}
      />

      <DemoSection
        title="Aggregating values — clusterProperties"
        description={
          <>
            <code>clusterProperties</code> rolls point properties up into each
            cluster with a MapLibre reduce expression, and the aggregates arrive
            as <code>renderCluster</code>'s third argument — here each bubble
            shows the summed sales of everything inside it.
          </>
        }
        code={clusterAggregateDemoSource}
        demo={<ClusterAggregateDemo />}
      />

      <PropsTable component="Cluster" />
    </Box>
  );
};

export default ClustersPage;

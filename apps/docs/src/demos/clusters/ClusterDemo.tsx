import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Map, Cluster, type ClusterPoint } from "zmapgl";
import { clusterPoints } from "../../data";

const ClusterDemo: FC = () => {
  const [radius, setRadius] = useState(50);
  const [selected, setSelected] = useState<ClusterPoint | null>(null);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        alignItems={{ sm: "center" }}
        sx={{ mb: 2 }}
      >
        <Box sx={{ width: 240 }}>
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
            label={`Selected: ${selected.longitude.toFixed(2)}, ${selected.latitude.toFixed(2)}`}
            onDelete={() => setSelected(null)}
            color="secondary"
            variant="outlined"
          />
        )}
      </Stack>

      <Map center={[20, 45]} zoom={2.4} sx={{ height: 440, borderRadius: 2 }}>
        <Cluster
          points={clusterPoints}
          radius={radius}
          color="primary.main"
          pointColor="secondary.main"
          onPointClick={(p) => setSelected(p)}
        />
      </Map>
    </Box>
  );
};

export default ClusterDemo;

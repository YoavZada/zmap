import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Map, PointLayer, SelectControl, type LayerPoint } from "zmapgl";
import { clusterPoints } from "../../data";

const SelectionDemo: FC = () => {
  const [selected, setSelected] = useState<LayerPoint[]>([]);

  return (
    <Box>
      <Map
        center={[-74.006, 40.7128]}
        zoom={8.5}
        sx={{ height: 440, borderRadius: 2 }}
      >
        <PointLayer
          points={clusterPoints}
          fillColor="primary.main"
          radius={4}
        />
        {/* arm the box or lasso tool, then drag to select — hits are
            highlighted and reported via onSelect */}
        <SelectControl points={clusterPoints} onSelect={setSelected} />
      </Map>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {selected.length} point{selected.length === 1 ? "" : "s"} selected.
      </Typography>
    </Box>
  );
};

export default SelectionDemo;

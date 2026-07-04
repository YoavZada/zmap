import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { Map, Marker } from "zmapgl";

const DraggableMarker: FC = () => {
  const [pos, setPos] = useState<[number, number]>([-74.006, 40.7128]);

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip
          label={`lng ${pos[0].toFixed(3)}`}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`lat ${pos[1].toFixed(3)}`}
          size="small"
          variant="outlined"
        />
      </Stack>
      <Map
        center={[-74.006, 40.7128]}
        zoom={10}
        sx={{ height: 360, borderRadius: 2 }}
      >
        <Marker
          longitude={pos[0]}
          latitude={pos[1]}
          draggable
          onDragEnd={(lngLat) => setPos(lngLat)}
        />
      </Map>
    </Box>
  );
};

export default DraggableMarker;

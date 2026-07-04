import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Map, Marker, type MapViewState } from "zmapgl";

const MapEventsDemo: FC = () => {
  const [pin, setPin] = useState<[number, number] | null>(null);
  const [view, setView] = useState<Required<MapViewState> | null>(null);

  return (
    <Box>
      <Map
        center={[12.49, 41.9]}
        zoom={4}
        sx={{ height: 440, borderRadius: 2 }}
        onClick={(e) => setPin([e.lngLat.lng, e.lngLat.lat])}
        onMoveEnd={setView}
      >
        {pin && <Marker longitude={pin[0]} latitude={pin[1]} />}
      </Map>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {pin
          ? `Pin at ${pin[1].toFixed(3)}, ${pin[0].toFixed(3)}. `
          : "Click the map to drop a pin. "}
        {view
          ? `Camera: ${view.center[1].toFixed(2)}, ${view.center[0].toFixed(2)} @ z${view.zoom.toFixed(1)}.`
          : "Pan or zoom to see the camera readout."}
      </Typography>
    </Box>
  );
};

export default MapEventsDemo;

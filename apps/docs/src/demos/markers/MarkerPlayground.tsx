import { useEffect, useRef, useState, type FC } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import type { MapMouseEvent } from "maplibre-gl";
import { Map, Marker, useMap } from "zmapgl";

type Pin = { id: number; longitude: number; latitude: number };

// Adds a pin wherever the user clicks the map. Rendered inside <Map>, so it can
// reach the underlying MapLibre instance through useMap().
const ClickToAdd: FC<{
  onAdd: (longitude: number, latitude: number) => void;
}> = ({ onAdd }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const onClick = (e: MapMouseEvent) => onAdd(e.lngLat.lng, e.lngLat.lat);
    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
    };
  }, [map, onAdd]);
  return null;
};

const MarkerPlayground: FC = () => {
  const [pins, setPins] = useState<Pin[]>([
    { id: 1, longitude: -0.118, latitude: 51.509 },
    { id: 2, longitude: 2.3522, latitude: 48.8566 },
  ]);
  const nextId = useRef(3);

  const addPin = (longitude: number, latitude: number) =>
    setPins((p) => [...p, { id: nextId.current++, longitude, latitude }]);
  const removePin = (id: number) =>
    setPins((p) => p.filter((x) => x.id !== id));
  const updatePin = (
    id: number,
    key: "longitude" | "latitude",
    value: number,
  ) => {
    if (Number.isNaN(value)) return;
    setPins((p) => p.map((x) => (x.id === id ? { ...x, [key]: value } : x)));
  };

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mb: 2, flexWrap: "wrap" }}
      >
        <Typography variant="body2" color="text.secondary">
          Click the map to add a marker; click a marker to remove it.
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Chip
          label={`${pins.length} markers`}
          size="small"
          variant="outlined"
        />
        <Button
          size="small"
          onClick={() => setPins([])}
          disabled={pins.length === 0}
        >
          Clear all
        </Button>
      </Stack>

      <Map center={[2, 30]} zoom={1.3} sx={{ height: 400, borderRadius: 2 }}>
        <ClickToAdd onAdd={addPin} />
        {pins.map((p) => (
          <Marker
            key={p.id}
            longitude={p.longitude}
            latitude={p.latitude}
            onClick={() => removePin(p.id)}
          />
        ))}
      </Map>

      <Box
        sx={{
          mt: 2,
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          maxHeight: 220,
          overflowY: "auto",
        }}
      >
        {pins.length === 0 ? (
          <Typography variant="body2" sx={{ p: 2, color: "text.secondary" }}>
            No markers yet — click the map to add one.
          </Typography>
        ) : (
          pins.map((p, i) => (
            <Box
              key={p.id}
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                px: 1.5,
                py: 1,
                "&:not(:last-of-type)": {
                  borderBottom: 1,
                  borderColor: "divider",
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 28,
                  color: "text.secondary",
                  fontFamily: "monospace",
                  fontSize: 13,
                }}
              >
                #{i + 1}
              </Box>
              <TextField
                label="Longitude"
                type="number"
                size="small"
                value={p.longitude}
                onChange={(e) =>
                  updatePin(p.id, "longitude", Number(e.target.value))
                }
                sx={{ width: 130 }}
              />
              <TextField
                label="Latitude"
                type="number"
                size="small"
                value={p.latitude}
                onChange={(e) =>
                  updatePin(p.id, "latitude", Number(e.target.value))
                }
                sx={{ width: 130 }}
              />
              <IconButton
                size="small"
                aria-label="remove marker"
                onClick={() => removePin(p.id)}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default MarkerPlayground;

import { useEffect, useRef, useState, type FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import type { MapMouseEvent } from "maplibre-gl";
import { Map, Marker, useMap } from "zmapgl";
import DemoSection from "../components/DemoSection";
import Styles from "./markersPage.style";
import { cities } from "../data";

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

const playgroundCode = `import { useEffect, useState, type FC } from "react";
import { Map, Marker, useMap } from "zmapgl";
import type { MapMouseEvent } from "maplibre-gl";

type Pin = { id: number; longitude: number; latitude: number };

const ClickToAdd: FC<{ onAdd: (lng: number, lat: number) => void }> = ({ onAdd }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const onClick = (e: MapMouseEvent) => onAdd(e.lngLat.lng, e.lngLat.lat);
    map.on("click", onClick);
    return () => map.off("click", onClick);
  }, [map, onAdd]);
  return null;
};

const MyMap: FC = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  let id = 0;
  return (
    <Map center={[2, 30]} zoom={1.4}>
      <ClickToAdd
        onAdd={(longitude, latitude) =>
          setPins((p) => [...p, { id: id++, longitude, latitude }])
        }
      />
      {pins.map((p) => (
        <Marker
          key={p.id}
          longitude={p.longitude}
          latitude={p.latitude}
          onClick={() => setPins((s) => s.filter((x) => x.id !== p.id))}
        />
      ))}
    </Map>
  );
};

export default MyMap;`;

const defaultCode = `import type { FC } from "react";
import { Map, Marker } from "zmapgl";

const MyMap: FC = () => {
  return (
    <Map center={[2, 30]} zoom={1.4}>
      {cities.map((c) => (
        <Marker
          key={c.name}
          longitude={c.coordinates[0]}
          latitude={c.coordinates[1]}
        />
      ))}
    </Map>
  );
};

export default MyMap;`;

const customCode = `import type { FC } from "react";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { Map, Marker } from "zmapgl";

const MyMap: FC = () => {
  return (
    <Map center={[1, 50]} zoom={4}>
      <Marker longitude={2.3522} latitude={48.8566} anchor="center">
        <Chip
          icon={<RestaurantIcon />}
          label="Le Jules Verne"
          color="primary"
          onClick={() => {}}
        />
      </Marker>

      <Marker longitude={-0.1276} latitude={51.5072} anchor="center">
        <Avatar sx={{ bgcolor: "secondary.main", border: "2px solid white" }}>
          LDN
        </Avatar>
      </Marker>
    </Map>
  );
};

export default MyMap;`;

const draggableCode = `import { useState, type FC } from "react";
import { Map, Marker } from "zmapgl";

const MyMap: FC = () => {
  const [pos, setPos] = useState<[number, number]>([-74, 40.7]);

  return (
    <Map center={[-74, 40.7]} zoom={10}>
      <Marker
        longitude={pos[0]}
        latitude={pos[1]}
        draggable
        onDragEnd={(lngLat) => setPos(lngLat)}
      />
    </Map>
  );
};

export default MyMap;`;

export const MarkersPage: FC = () => {
  const [pos, setPos] = useState<[number, number]>([-74.006, 40.7128]);
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
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Markers
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        A <code>Marker</code> places content at a coordinate via a React portal,
        so you can render any MUI element — icons, chips, avatars, cards. With
        no children it falls back to a themed pin.
      </Typography>

      <DemoSection
        title="Interactive playground"
        description="Click the map to drop a marker, click a marker to remove it, or edit a marker's coordinates below."
        code={playgroundCode}
        demo={
          <Box>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={Styles.toolbar}
            >
              <Typography variant="body2" color="text.secondary">
                Click the map to add a marker; click a marker to remove it.
              </Typography>
              <Box sx={Styles.spacer} />
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

            <Map center={[2, 30]} zoom={1.3} sx={Styles.map(400)}>
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

            <Box sx={Styles.editor}>
              {pins.length === 0 ? (
                <Typography variant="body2" sx={Styles.empty}>
                  No markers yet — click the map to add one.
                </Typography>
              ) : (
                pins.map((p, i) => (
                  <Box key={p.id} sx={Styles.editorRow}>
                    <Box component="span" sx={Styles.editorIndex}>
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
                      sx={Styles.coordField}
                    />
                    <TextField
                      label="Latitude"
                      type="number"
                      size="small"
                      value={p.latitude}
                      onChange={(e) =>
                        updatePin(p.id, "latitude", Number(e.target.value))
                      }
                      sx={Styles.coordField}
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
        }
      />

      <DemoSection
        title="Default pins"
        description="Render a Marker with no children to get a theme-colored pin."
        code={defaultCode}
        demo={
          <Map center={[2, 30]} zoom={1.3} sx={Styles.map(380)}>
            {cities.map((c) => (
              <Marker
                key={c.name}
                longitude={c.coordinates[0]}
                latitude={c.coordinates[1]}
              />
            ))}
          </Map>
        }
      />

      <DemoSection
        title="Custom MUI markers"
        description="Pass any MUI component as children. Use anchor='center' for badges and chips."
        code={customCode}
        demo={
          <Map center={[1, 50]} zoom={4} sx={Styles.map(380)}>
            <Marker longitude={2.3522} latitude={48.8566} anchor="center">
              <Chip
                icon={<RestaurantIcon />}
                label="Le Jules Verne"
                color="primary"
              />
            </Marker>
            <Marker longitude={-0.1276} latitude={51.5072} anchor="center">
              <Avatar sx={Styles.avatar}>LDN</Avatar>
            </Marker>
          </Map>
        }
      />

      <DemoSection
        title="Draggable markers"
        description="Set draggable and read the new position from onDragEnd."
        code={draggableCode}
        demo={
          <Box>
            <Stack direction="row" spacing={1} sx={Styles.controls}>
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
            <Map center={[-74.006, 40.7128]} zoom={10} sx={Styles.map(360)}>
              <Marker
                longitude={pos[0]}
                latitude={pos[1]}
                draggable
                onDragEnd={(lngLat) => setPos(lngLat)}
              />
            </Map>
          </Box>
        }
      />
    </Box>
  );
};

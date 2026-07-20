import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Map, MapControls, Cluster, Popup, type MapViewState } from "zmapgl";

// --- demo data ---
const stores = [
  {
    id: 1,
    name: "Soho Roastery",
    address: "12 Greek St",
    longitude: -0.1312,
    latitude: 51.5136,
  },
  {
    id: 2,
    name: "Borough Beans",
    address: "8 Stoney St",
    longitude: -0.091,
    latitude: 51.5055,
  },
  {
    id: 3,
    name: "Shoreditch Grind",
    address: "213 Old St",
    longitude: -0.0879,
    latitude: 51.5265,
  },
  {
    id: 4,
    name: "Kings Cross Filter",
    address: "1 Granary Sq",
    longitude: -0.1257,
    latitude: 51.5355,
  },
  {
    id: 5,
    name: "Notting Hill Brew",
    address: "20 Portobello Rd",
    longitude: -0.2005,
    latitude: 51.5152,
  },
  {
    id: 6,
    name: "Camden Lock Coffee",
    address: "54 Chalk Farm Rd",
    longitude: -0.1466,
    latitude: 51.5413,
  },
  {
    id: 7,
    name: "Greenwich Grounds",
    address: "3 College Way",
    longitude: -0.0077,
    latitude: 51.4826,
  },
  {
    id: 8,
    name: "Brixton Blend",
    address: "40 Electric Ave",
    longitude: -0.1147,
    latitude: 51.4622,
  },
  {
    id: 9,
    name: "Hampstead House",
    address: "77 Heath St",
    longitude: -0.1786,
    latitude: 51.5566,
  },
  {
    id: 10,
    name: "Canary Wharf Cup",
    address: "5 Cabot Sq",
    longitude: -0.0235,
    latitude: 51.5054,
  },
  {
    id: 11,
    name: "Chelsea Cortado",
    address: "170 Kings Rd",
    longitude: -0.1687,
    latitude: 51.4875,
  },
  {
    id: 12,
    name: "Islington Espresso",
    address: "31 Upper St",
    longitude: -0.1027,
    latitude: 51.5362,
  },
];
type Store = (typeof stores)[number];

const HOME: MapViewState = { center: [-0.115, 51.512], zoom: 10.8 };

/**
 * Store locator: clustered locations, a synced list panel, and a details
 * popup. Selecting a row (or clicking a point) eases the camera over.
 */
const StoreLocatorBlock: FC = () => {
  const [selected, setSelected] = useState<Store | null>(null);
  const [view, setView] = useState<MapViewState>(HOME);

  const select = (store: Store) => {
    setSelected(store);
    setView({ center: [store.longitude, store.latitude], zoom: 13.5 });
  };

  return (
    <Box sx={{ position: "relative", height: 560 }}>
      <Map
        view={view}
        onMoveEnd={setView}
        sx={{ height: "100%", borderRadius: 2 }}
      >
        <MapControls position="top-right" />
        <Cluster
          points={stores}
          color="primary.main"
          pointColor="secondary.main"
          onPointClick={(_point, index) => select(stores[index])}
        />
        {selected && (
          <Popup
            longitude={selected.longitude}
            latitude={selected.latitude}
            open
            onClose={() => setSelected(null)}
            offset={14}
          >
            <Typography variant="subtitle2">{selected.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selected.address}
            </Typography>
          </Popup>
        )}
      </Map>

      {/* The list panel floats over the map and stays in sync with it. */}
      <Paper
        elevation={4}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          width: 240,
          maxHeight: "calc(100% - 32px)",
          overflow: "auto",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ px: 2, pt: 1.5, display: "block" }}
        >
          {stores.length} stores
        </Typography>
        <List dense disablePadding sx={{ pb: 1 }}>
          {stores.map((store) => (
            <ListItemButton
              key={store.id}
              selected={selected?.id === store.id}
              onClick={() => select(store)}
            >
              <ListItemText primary={store.name} secondary={store.address} />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default StoreLocatorBlock;

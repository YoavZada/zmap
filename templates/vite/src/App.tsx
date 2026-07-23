import type { FC } from "react";
import Box from "@mui/material/Box";
import { Map, MapControls, Marker } from "zmapgl";

const App: FC = () => {
  return (
    <Box sx={{ height: "100dvh" }}>
      <Map center={[-0.1276, 51.5072]} zoom={11} sx={{ height: "100%" }}>
        <MapControls position="top-right" />
        <Marker longitude={-0.1276} latitude={51.5072} />
      </Map>
    </Box>
  );
};

export default App;

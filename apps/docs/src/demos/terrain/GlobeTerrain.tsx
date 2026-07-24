import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { Map, MapControls, Terrain } from "zmapgl";

const GlobeTerrain: FC = () => {
  const [globe, setGlobe] = useState(true);
  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={globe}
            onChange={(e) => setGlobe(e.target.checked)}
          />
        }
        label="Globe projection"
        sx={{ mb: 1 }}
      />
      <Map
        center={[7.5, 46.5]}
        zoom={7}
        projection={globe ? "globe" : "mercator"}
        mapOptions={{ pitch: 60 }}
        sx={{ height: 460, borderRadius: 2 }}
      >
        <Terrain exaggeration={1.4} sky />
        <MapControls showPitch />
      </Map>
    </Box>
  );
};

export default GlobeTerrain;

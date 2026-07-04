import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { Map, SymbolLayer } from "zmapgl";
import { cities } from "../../data";

const points = cities.map((c) => ({
  longitude: c.coordinates[0],
  latitude: c.coordinates[1],
  label: c.name,
}));

const SymbolLabels: FC = () => {
  const [overlap, setOverlap] = useState(false);

  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={overlap}
            onChange={(_, v) => setOverlap(v)}
          />
        }
        label="Allow overlapping labels"
        sx={{ mb: 1 }}
      />
      <Map center={[10, 20]} zoom={1.2} sx={{ height: 420, borderRadius: 2 }}>
        {/* One GPU symbol layer for all labels — MapLibre declutters
            collisions as you zoom (toggle the switch to draw them all) */}
        <SymbolLayer
          points={points}
          color="secondary.main"
          size={13}
          allowOverlap={overlap}
          onClick={(p) => console.log(p.label)}
        />
      </Map>
    </Box>
  );
};

export default SymbolLabels;

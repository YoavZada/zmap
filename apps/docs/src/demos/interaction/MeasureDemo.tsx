import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Map, MeasureControl, type MeasureUnit } from "zmapgl";

const MeasureDemo: FC = () => {
  const [unit, setUnit] = useState<MeasureUnit>("metric");

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={unit}
          onChange={(_, v: MeasureUnit | null) => v && setUnit(v)}
        >
          <ToggleButton value="metric">metric</ToggleButton>
          <ToggleButton value="imperial">imperial</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Map
        center={[-0.1276, 51.5072]}
        zoom={12}
        sx={{ height: 440, borderRadius: 2 }}
      >
        {/* draw a line → distance; a polygon → area, in live MUI chips */}
        <MeasureControl
          position="top-left"
          readoutPosition="top-right"
          unit={unit}
        />
      </Map>
    </Box>
  );
};

export default MeasureDemo;

import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { Map, Arc, Marker, type ArcType } from "zmapgl";
import { flights } from "../../data";

const ArcDemo: FC = () => {
  const [curvature, setCurvature] = useState(0.3);
  const [type, setType] = useState<ArcType>("bezier");

  const origin = flights[0].from;

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        alignItems={{ sm: "center" }}
        sx={{ mb: 2 }}
      >
        <ToggleButtonGroup
          size="small"
          exclusive
          value={type}
          onChange={(_, v) => v && setType(v)}
        >
          <ToggleButton value="bezier">bezier</ToggleButton>
          <ToggleButton value="geodesic">geodesic</ToggleButton>
        </ToggleButtonGroup>
        {/* the curvature slider only applies to bezier arcs */}
        <Box sx={{ width: 240, opacity: type === "bezier" ? 1 : 0.4 }}>
          <Typography variant="caption" color="text.secondary">
            Curvature: {curvature.toFixed(2)}
          </Typography>
          <Slider
            size="small"
            min={0}
            max={0.8}
            step={0.05}
            value={curvature}
            disabled={type !== "bezier"}
            onChange={(_, v) => setCurvature(v as number)}
          />
        </Box>
      </Stack>

      <Map center={[-40, 30]} zoom={1.5} sx={{ height: 460, borderRadius: 2 }}>
        <Marker longitude={origin[0]} latitude={origin[1]} />
        {flights.map((f, i) => (
          <Box key={f.label}>
            <Arc
              from={f.from}
              to={f.to}
              type={type}
              curvature={curvature}
              color={i % 2 ? "secondary.main" : "primary.main"}
              width={2}
            />
            {/* endpoint dot tinted with the arc's palette color */}
            <Marker longitude={f.to[0]} latitude={f.to[1]} anchor="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: i % 2 ? "secondary.main" : "primary.main",
                  border: "2px solid",
                  borderColor: "background.paper",
                }}
              />
            </Marker>
          </Box>
        ))}
      </Map>
    </Box>
  );
};

export default ArcDemo;

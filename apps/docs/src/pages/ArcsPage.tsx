import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Map, Arc, Marker } from "zmap";
import type { ArcType } from "zmap";
import DemoSection from "../components/DemoSection";
import Styles from "./arcsPage.style";
import { flights } from "../data";

const code = `import type { FC } from "react";
import { Map, Arc, Marker } from "zmap";

const MyMap: FC = () => {
  return (
    <Map center={[-40, 35]} zoom={1.6}>
      <Arc
        from={[-74.006, 40.7128]}   // JFK
        to={[-0.1276, 51.5072]}     // LHR
        type="bezier"               // or "geodesic"
        curvature={0.3}
        color="secondary.main"
        width={2}
      />
    </Map>
  );
};

export default MyMap;`;

export function ArcsPage() {
  const [curvature, setCurvature] = useState(0.3);
  const [type, setType] = useState<ArcType>("bezier");

  const origin = flights[0].from;

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Arcs
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        <code>Arc</code> draws a curved line between two points — perfect for
        flight paths and connection maps. Choose a <code>"bezier"</code> bulge or
        a <code>"geodesic"</code> great-circle path.
      </Typography>

      <DemoSection
        title="Flights out of New York"
        description="Tune the curvature or switch to a great-circle path."
        code={code}
        demo={
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              alignItems={{ sm: "center" }}
              sx={Styles.controls}
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
              <Box sx={Styles.curvatureBox(type === "bezier")}>
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

            <Map center={[-40, 30]} zoom={1.5} sx={Styles.map}>
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
                  <Marker
                    longitude={f.to[0]}
                    latitude={f.to[1]}
                    anchor="center"
                  >
                    <Box
                      sx={Styles.dot(i % 2 ? "secondary.main" : "primary.main")}
                    />
                  </Marker>
                </Box>
              ))}
            </Map>
          </Box>
        }
      />
    </Box>
  );
}

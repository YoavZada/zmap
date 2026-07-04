import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Map, DrawControl, type DrawFeature } from "zmapgl";

function countByMode(shapes: DrawFeature[]) {
  const counts = { point: 0, line: 0, polygon: 0 };
  for (const s of shapes) counts[s.properties.mode] += 1;
  return counts;
}

const DrawToolsDemo: FC = () => {
  const [shapes, setShapes] = useState<DrawFeature[]>([]);

  const counts = countByMode(shapes);

  return (
    <Box>
      <Map
        center={[-0.1276, 51.5072]}
        zoom={12}
        sx={{ height: 440, borderRadius: 2 }}
      >
        {/* point / line / polygon — double-click or Enter to finish,
            Backspace to undo a vertex, Esc to cancel */}
        <DrawControl position="top-left" onChange={setShapes} />
      </Map>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Drawn: {counts.point} point{counts.point === 1 ? "" : "s"},{" "}
        {counts.line} line{counts.line === 1 ? "" : "s"}, {counts.polygon}{" "}
        polygon{counts.polygon === 1 ? "" : "s"}.
      </Typography>
    </Box>
  );
};

export default DrawToolsDemo;

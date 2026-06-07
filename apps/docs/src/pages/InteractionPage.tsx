import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {
  Map,
  DrawControl,
  MeasureControl,
  ContextMenu,
  SelectControl,
  PointLayer,
  type DrawFeature,
  type LayerPoint,
  type MeasureUnit,
} from "zmapgl";
import DemoSection from "../components/DemoSection";
import Styles from "./interactionPage.style";
import { clusterPoints } from "../data";

const drawCode = `import { useState, type FC } from "react";
import { Map, DrawControl, type DrawFeature } from "zmapgl";

const MyMap: FC = () => {
  const [shapes, setShapes] = useState<DrawFeature[]>([]);
  return (
    <Map center={[-0.1276, 51.5072]} zoom={12}>
      {/* point / line / polygon — double-click or Enter to finish,
          Backspace to undo a vertex, Esc to cancel */}
      <DrawControl position="top-left" onChange={setShapes} />
    </Map>
  );
};

export default MyMap;`;

const measureCode = `import type { FC } from "react";
import { Map, MeasureControl } from "zmapgl";

const MyMap: FC = () => {
  return (
    <Map center={[-0.1276, 51.5072]} zoom={12}>
      {/* draw a line → distance; a polygon → area, in live MUI chips */}
      <MeasureControl
        position="top-left"
        readoutPosition="top-right"
        unit="metric"
      />
    </Map>
  );
};

export default MyMap;`;

const contextMenuCode = `import type { FC } from "react";
import { Map, ContextMenu } from "zmapgl";

const MyMap: FC = () => {
  return (
    <Map center={[2.3522, 48.8566]} zoom={4}>
      {/* right-click the map → "Center here" / "Copy coords" / "Drop marker".
          Dropped markers are draggable; click one to remove it. */}
      <ContextMenu />

      {/* or supply your own items:
          <ContextMenu items={(lngLat) => [
            { label: "Log here", icon: <Place />, onClick: () => console.log(lngLat) },
          ]} /> */}
    </Map>
  );
};

export default MyMap;`;

const selectCode = `import { useState, type FC } from "react";
import { Map, PointLayer, SelectControl, type LayerPoint } from "zmapgl";

const MyMap: FC = () => {
  const [selected, setSelected] = useState<LayerPoint[]>([]);
  return (
    <Map center={[-74.006, 40.7128]} zoom={8.5}>
      <PointLayer points={points} radius={4} />
      {/* arm the box or lasso tool, then drag to select — hits are highlighted */}
      <SelectControl points={points} onSelect={setSelected} />
    </Map>
  );
};

export default MyMap;`;

function countByMode(shapes: DrawFeature[]) {
  const counts = { point: 0, line: 0, polygon: 0 };
  for (const s of shapes) counts[s.properties.mode] += 1;
  return counts;
}

export const InteractionPage: FC = () => {
  const [shapes, setShapes] = useState<DrawFeature[]>([]);
  const [unit, setUnit] = useState<MeasureUnit>("metric");
  const [selected, setSelected] = useState<LayerPoint[]>([]);

  const counts = countByMode(shapes);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Interaction
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        Tools that let people draw on, measure, and select from the map. Every
        one is plain MUI — the toolbars, chips, and menus inherit your theme
        (light/dark, palette, shape) automatically. Try them, then toggle dark
        mode.
      </Typography>

      <DemoSection
        title="Draw tools"
        description={
          <>
            <code>&lt;DrawControl&gt;</code> drops a point/line/polygon palette
            on the map. Click to add vertices; double-click or{" "}
            <code>Enter</code> finishes a shape, <code>Backspace</code> removes
            the last vertex, and <code>Esc</code> cancels. Completed shapes
            render through <code>&lt;ShapeLayer&gt;</code> /{" "}
            <code>&lt;PointLayer&gt;</code> and are emitted as plain GeoJSON via{" "}
            <code>onChange</code> / <code>onCreate</code>.
          </>
        }
        code={drawCode}
        demo={
          <Box>
            <Map center={[-0.1276, 51.5072]} zoom={12} sx={Styles.map}>
              <DrawControl position="top-left" onChange={setShapes} />
            </Map>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={Styles.readout}
            >
              Drawn: {counts.point} point{counts.point === 1 ? "" : "s"},{" "}
              {counts.line} line{counts.line === 1 ? "" : "s"}, {counts.polygon}{" "}
              polygon{counts.polygon === 1 ? "" : "s"}.
            </Typography>
          </Box>
        }
      />

      <DemoSection
        title="Measure distance & area"
        description={
          <>
            <code>&lt;MeasureControl&gt;</code> is the same drawing engine with
            a tape measure attached: draw a line to read its length, or a
            polygon to read its area. Values update live as you move and stick
            around in deletable chips. Switch the unit system below.
          </>
        }
        code={measureCode}
        demo={
          <Box>
            <Stack direction="row" spacing={2} sx={Styles.controls}>
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
            <Map center={[-0.1276, 51.5072]} zoom={12} sx={Styles.map}>
              <MeasureControl
                position="top-left"
                readoutPosition="top-right"
                unit={unit}
              />
            </Map>
          </Box>
        }
      />

      <DemoSection
        title="Right-click context menu"
        description={
          <>
            <code>&lt;ContextMenu&gt;</code> opens a themed MUI menu at the
            clicked coordinate. The built-ins center the map, copy the
            coordinates, and drop a draggable marker (click a marker to remove
            it) — or pass your own <code>items</code>. Right-click anywhere on
            the map.
          </>
        }
        code={contextMenuCode}
        demo={
          <Map center={[2.3522, 48.8566]} zoom={4} sx={Styles.map}>
            <ContextMenu />
          </Map>
        }
      />

      <DemoSection
        title="Box & lasso selection"
        description={
          <>
            <code>&lt;SelectControl&gt;</code> selects{" "}
            <code>&lt;PointLayer&gt;</code> features by dragging a marquee box
            or a freehand lasso. While a tool is armed, panning is suspended so
            the drag draws the selection; the hits are highlighted and reported
            via <code>onSelect</code>. Arm a tool (top-left), then drag across
            the cluster.
          </>
        }
        code={selectCode}
        demo={
          <Box>
            <Map center={[-74.006, 40.7128]} zoom={8.5} sx={Styles.map}>
              <PointLayer
                points={clusterPoints}
                color="primary.main"
                radius={4}
              />
              <SelectControl points={clusterPoints} onSelect={setSelected} />
            </Map>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={Styles.readout}
            >
              {selected.length} point{selected.length === 1 ? "" : "s"}{" "}
              selected.
            </Typography>
          </Box>
        }
      />
    </Box>
  );
};

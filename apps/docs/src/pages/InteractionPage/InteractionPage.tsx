import type { FC } from "react";
import Box from "@mui/material/Box";
import DemoSection from "../../components/DemoSection";
import PageHeader from "../../components/PageHeader";
import PropsTable from "../../components/PropsTable";
import MapEventsDemo from "../../demos/interaction/MapEventsDemo";
import mapEventsDemoSource from "../../demos/interaction/MapEventsDemo.tsx?raw";
import DeclarativeCameraDemo from "../../demos/interaction/DeclarativeCameraDemo";
import declarativeCameraDemoSource from "../../demos/interaction/DeclarativeCameraDemo.tsx?raw";
import DrawToolsDemo from "../../demos/interaction/DrawToolsDemo";
import drawToolsDemoSource from "../../demos/interaction/DrawToolsDemo.tsx?raw";
import MeasureDemo from "../../demos/interaction/MeasureDemo";
import measureDemoSource from "../../demos/interaction/MeasureDemo.tsx?raw";
import ContextMenuDemo from "../../demos/interaction/ContextMenuDemo";
import contextMenuDemoSource from "../../demos/interaction/ContextMenuDemo.tsx?raw";
import SelectionDemo from "../../demos/interaction/SelectionDemo";
import selectionDemoSource from "../../demos/interaction/SelectionDemo.tsx?raw";

const InteractionPage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Interaction"
        lead="React to what people do on the map — clicks, pans, zooms — and drive the camera declaratively, plus tools that let them draw, measure, and select. Every control is plain MUI — the toolbars, chips, and menus inherit your theme (light/dark, palette, shape) automatically."
      />

      <DemoSection
        title="Map events"
        description={
          <>
            <code>&lt;Map&gt;</code> promotes the everyday MapLibre events to
            props: <code>onClick</code>, <code>onDblClick</code>,{" "}
            <code>onContextMenu</code> receive the raw mouse event (with{" "}
            <code>lngLat</code>), while <code>onMove</code>,{" "}
            <code>onMoveEnd</code>, and <code>onZoomEnd</code> hand you the
            camera state. Click anywhere to drop a pin, then pan around and
            watch the readout.
          </>
        }
        code={mapEventsDemoSource}
        demo={<MapEventsDemo />}
      />

      <DemoSection
        title="Declarative camera"
        description={
          <>
            The <code>view</code> prop eases the camera to a new position
            whenever it changes — unlike <code>initialView</code>, which only
            applies at creation. The user can still pan freely in between, and
            feeding <code>onMoveEnd</code> back into <code>view</code> doesn't
            loop. <code>fitBounds</code> refits declaratively when its value
            changes; <code>animate</code> tunes or disables the transition.
          </>
        }
        code={declarativeCameraDemoSource}
        demo={<DeclarativeCameraDemo />}
      />

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
        code={drawToolsDemoSource}
        demo={<DrawToolsDemo />}
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
        code={measureDemoSource}
        demo={<MeasureDemo />}
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
        code={contextMenuDemoSource}
        demo={<ContextMenuDemo />}
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
        code={selectionDemoSource}
        demo={<SelectionDemo />}
      />
      <PropsTable component="DrawControl" />
      <PropsTable component="MeasureControl" />
      <PropsTable component="ContextMenu" />
      <PropsTable component="SelectControl" />
    </Box>
  );
};

export default InteractionPage;

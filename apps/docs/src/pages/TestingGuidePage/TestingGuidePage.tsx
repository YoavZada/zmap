import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CodeBlock from "../../components/CodeBlock";
import PageHeader from "../../components/PageHeader";
import Styles from "./testingGuidePage.style";

const installCode = `npm install -D vitest @testing-library/react jsdom`;

const mockCode = `import { vi } from "vitest";

vi.mock("maplibre-gl", () => import("zmapgl/testing"));`;

const renderLoadCode = `import { render, act } from "@testing-library/react";
import { lastFakeMap } from "zmapgl/testing";
import { Map, PointLayer } from "zmapgl";

test("adds a circle layer for the stores source", () => {
  render(
    <Map center={[-0.1276, 51.5072]} zoom={11}>
      <PointLayer id="stores" points={points} />
    </Map>,
  );
  act(() => lastFakeMap().fire("load")); // children only mount after "load"

  expect(lastFakeMap().getSource("stores")).toBeDefined();
});`;

const fireLayerCode = `import { layerIds } from "zmapgl";

// PointLayer("stores") generates one sub-layer: "stores-circle".
const [circleLayerId] = layerIds("PointLayer", "stores");

act(() => {
  lastFakeMap().fireLayer("click", circleLayerId, {
    features: [{ properties: { name: "Camden" } }],
  });
});

expect(onClick).toHaveBeenCalledWith(
  expect.objectContaining({ properties: { name: "Camden" } }),
  0,
  expect.anything(), // the raw MapLayerMouseEvent
);`;

const assertGlStateCode = `// Assert on the generated layer/source instead of re-deriving colors:
const layer = lastFakeMap().getLayer(circleLayerId);
expect(layer.paint["circle-color"]).toBe("#1976d2");

// A reactive data/points update calls setData in place — no remount, no
// flicker. Re-render with new points, then assert the call happened:
const source = lastFakeMap().getSource("stores");
expect(source.setData).toHaveBeenCalledTimes(1);`;

const popupCode = `import { lastFakePopup } from "zmapgl/testing";
import { Map, Popup } from "zmapgl";

render(
  <Map center={[-0.1276, 51.5072]} zoom={11}>
    <Popup longitude={-0.1276} latitude={51.5072}>
      Hello, London
    </Popup>
  </Map>,
);
act(() => lastFakeMap().fire("load"));

expect(lastFakePopup().isOpen()).toBe(true);`;

const isolationCode = `import { resetFakeMaps, resetFakeMarkers, resetFakePopups } from "zmapgl/testing";

afterEach(() => {
  resetFakeMaps();
  resetFakeMarkers();
  resetFakePopups();
});`;

const TestingGuidePage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Testing"
        lead="zmapgl ships the same in-memory test double its own ~50-file unit suite runs against, as the zmapgl/testing subpath — no need to hand-roll a maplibre-gl mock."
      />

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Install
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          <code>zmapgl/testing</code> is Vitest-only — it's built on Vitest's{" "}
          <code>vi</code> and published ESM-only, so it works with{" "}
          <code>vi.mock</code> in a Vitest suite but not with Jest or a CJS{" "}
          <code>require()</code>.
        </Typography>
        <CodeBlock code={installCode} language="bash" filename="Terminal" />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Mock maplibre-gl
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Real MapLibre can't run in jsdom (WebGL, workers). Point the module
          mock at the package's own test double instead of writing one:
        </Typography>
        <CodeBlock code={mockCode} filename="setup / test file" />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Render, then fire "load"
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          A <code>&lt;Map&gt;</code>'s children only mount once the map has
          loaded — fire that event yourself, wrapped in <code>act</code>, then
          grab the instance <code>lastFakeMap()</code> just constructed:
        </Typography>
        <CodeBlock code={renderLoadCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Firing layer events
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          GL layer components generate predictable per-role MapLibre layer ids —
          use <code>layerIds(component, id)</code> instead of guessing a suffix,
          then drive clicks/hover with{" "}
          <code>fireLayer(event, layerId, payload)</code>:
        </Typography>
        <CodeBlock code={fireLayerCode} />
        <Typography color="text.secondary" sx={Styles.trailingNote}>
          Assert on the generated GL state the same way — <code>getLayer</code>
          's paint/layout, or that a reactive data update called{" "}
          <code>setData</code> instead of remounting the source:
        </Typography>
        <CodeBlock code={assertGlStateCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Popups & tooltips
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          <code>lastFakePopup()</code> mirrors <code>lastFakeMap()</code> for
          the most recently constructed <code>Popup</code>/<code>Tooltip</code>:
        </Typography>
        <CodeBlock code={popupCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Isolating tests
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Every fake constructor pushes onto a module-level array so{" "}
          <code>lastFakeMap()</code>/<code>lastFakePopup()</code> can find the
          newest one — reset them between tests so an earlier test's instance
          can't leak into the next:
        </Typography>
        <CodeBlock code={isolationCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          e2e: structure, never pixels
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          zmapgl's own <code>tools/e2e</code> suite drives a real browser
          (Playwright) against the docs site, and deliberately never asserts on
          tile pixels — a live basemap comes from a real network, and a
          grey/slow tile host must not fail the build. Instead it asserts on
          structure: the map container gets <code>[data-zmap-loaded]</code>,
          expected MapLibre layer ids/GeoJSON sources exist, no console/page
          errors fired, and — separately — an axe scan finds zero
          serious/critical accessibility violations. That split (fast, precise
          unit tests against the fake; coarse, real-browser structural checks
          for e2e) is the same split worth keeping in a consumer app.
        </Typography>
      </Box>
    </Box>
  );
};

export default TestingGuidePage;

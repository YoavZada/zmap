import type { FC } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import CodeBlock from "../../components/CodeBlock";
import PageHeader from "../../components/PageHeader";
import Styles from "./troubleshootingGuidePage.style";

const blankMapCode = `// 1. The map's CSS ships with the package — import it once, in your app entry.
import "zmapgl/styles.css";

// 2. The container needs real height: a map in a 0-height div renders nothing.
<Map sx={{ height: 420 }} />   {/* ✅ */}
<Map />                        {/* ❌ height: auto with no content — collapses to 0 */}`;

const noWebglCode = `// No WebGL (old browser, disabled GPU, some headless/CI runners): the map
// can't initialize and onError fires with kind "init". Customize what shows
// instead of the default "Unable to load the map" panel:
<Map
  fallback={<Alert severity="warning">This map needs WebGL.</Alert>}
  onError={(error, kind) => kind === "init" && reportToSentry(error)}
/>`;

const layersVanishCode = `// ❌ vanishes on the next light/dark toggle — setStyle() wipes every
// custom source and layer it didn't add itself
useEffect(() => {
  if (!map) return;
  map.addSource("stores", { type: "geojson", data });
  map.addLayer({ id: "stores-circle", type: "circle", source: "stores" });
}, [map]);

// ✅ survives — useMapLayer re-adds the source/layers on every "styledata"
useMapLayer({
  id: "stores",
  source: { type: "geojson", data },
  layers: [{ id: "stores-circle", type: "circle", paint: { /* … */ } }],
});

// ✅ simplest — the layer components are built on useMapLayer already
<PointLayer id="stores" points={points} />`;

const hoverNothingCode = `// Hover highlighting reads MapLibre feature-state, which needs a stable
// numeric feature id. Every layer component generates one automatically
// (generateId) — just opt in to the highlight:
<PointLayer id="stores" points={points} hoverHighlight />

// Explicit colors instead of the theme defaults:
<PointLayer
  id="stores"
  points={points}
  hoverHighlight={{ fillColor: "warning.main" }}
/>

// Prefer your own property as the stable id (e.g. it survives a full data
// reload where generateId's per-render ids would not):
<PointLayer id="stores" points={points} featureId="storeId" hoverHighlight />`;

type ErrorKindRow = { kind: string; when: string };

const errorKinds: ErrorKindRow[] = [
  {
    kind: '"init"',
    when: "The map failed to construct at all (no WebGL, a bad style URL).",
  },
  {
    kind: '"runtime"',
    when: 'MapLibre emitted an "error" event outside of tile/style/layer loading.',
  },
  {
    kind: '"tile"',
    when: "A tile/source request failed (404s from a misconfigured provider, a blocked host). Deduped per source for 5 seconds so a flaky/blocked tile host can't flood your handler.",
  },
  {
    kind: '"layer"',
    when: "Adding a layer or source spec failed (e.g. a bad paint/layout expression).",
  },
  {
    kind: '"style"',
    when: "The basemap style itself failed to load (bad style URL/spec, provider outage).",
  },
  {
    kind: '"webgl"',
    when: "The WebGL context was lost — a GPU driver reset, or the laptop waking from sleep.",
  },
];

const onErrorCode = `<Map
  onError={(error, kind) => {
    if (kind === "tile") return; // already deduped, usually not worth surfacing
    reportToSentry(error, { kind });
  }}
/>`;

const webglLostCode = `// While the context is lost, <Map fallback> renders in place of the map
// (same panel as an "init" failure). Once the browser restores the context,
// zmapgl's children remount automatically — no reload needed.
<Map
  fallback={<MapUnavailablePanel />}
  onError={(error, kind) => kind === "webgl" && trackGpuReset()}
/>`;

const fullscreenOverlayCode = `// v0.10: ControlTooltip, ContextMenu, and the geocoder result list already
// portal into the map's own root node instead of document.body, so they
// stay visible when the map (or an ancestor) is in the Fullscreen API.
// Build your own overlay on the same primitive:
import { usePortalContainer } from "zmapgl";
import { createPortal } from "react-dom";

const MyMenu: FC = () => {
  const container = usePortalContainer(); // the map's root node, or null before mount
  return createPortal(<Menu>{/* … */}</Menu>, container ?? document.body);
};`;

const geocoderClippedCode = `// GeocoderControl's results list already uses a fixed-strategy popper, so
// the map's own overflow: hidden can't clip it. A genuinely short map just
// doesn't leave visual room for a dropdown — give it real height:
<Map sx={{ height: 420 }}>
  <GeocoderControl />
</Map>`;

const transformRequestCode = `<Map
  transformRequest={(url, resourceType) => {
    if (resourceType === "Tile" && url.startsWith("https://tiles.example.com")) {
      return { url, headers: { Authorization: \`Bearer \${token}\` } };
    }
    return { url };
  }}
/>`;

const cjsEsmCode = `// The main package ships both conditions — works from either module system:
import { Map } from "zmapgl";        // ESM
const { Map } = require("zmapgl");   // CJS — also fine

// zmapgl/testing is ESM-only (Vitest's own module refuses to load under
// require()). Only import it from an ESM test file — Vitest's default:
import { lastFakeMap } from "zmapgl/testing";   // ✅
require("zmapgl/testing");                       // ❌ throws`;

const compatCode = `// devDependencies pinned to the latest majors, but the advertised peer
// range is wider — and CI proves both ends of it on every PR:
"peerDependencies": {
  "react": "^18 || ^19",
  "@mui/material": "^6 || ^7",
  "@mui/icons-material": "^6 || ^7"
}
// .github/workflows/ci.yml's "compat" job downgrades a runner to
// React 18 + MUI 6 and reruns typecheck + the full unit suite against it.`;

const useClientCode = `// dist ships tsup's "use client" banner — but a monorepo that aliases
// zmapgl straight to source (this repo's own docs/pathfinder vite configs
// do this, for hot-reload) never sees a build banner. So the directive is
// also written at the top of the source file itself:
// packages/zmap/src/index.ts
"use client";

import maplibreglNamespace from "maplibre-gl";
// …

// If you alias zmapgl to its src/ in your own workspace and hit an RSC
// "hooks can only be called in a Client Component" error, check that your
// bundler still honors an in-source "use client" directive (most do).`;

const TroubleshootingGuidePage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Troubleshooting"
        lead="Symptom, cause, and fix for the issues that come up most — blank maps, layers that vanish, hover that does nothing, and a few packaging gotchas."
      />

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Blank or grey map
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Two causes cover almost every report: the stylesheet was never
          imported, or the map's container has no height (a MUI <code>Box</code>{" "}
          with no explicit size collapses to 0).
        </Typography>
        <CodeBlock code={blankMapCode} filename="App entry" />
        <Typography color="text.secondary" sx={Styles.trailingNote}>
          If it's neither of those, the browser (or CI runner) may not have
          WebGL at all — that's an initialization failure, not a blank
          container, and shows the <code>fallback</code> panel instead:
        </Typography>
        <CodeBlock code={noWebglCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Layers vanish on a theme toggle
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          A light/dark flip calls MapLibre's <code>setStyle()</code>, which
          destroys every source and layer that isn't part of the new style —
          including anything added with a raw <code>map.addLayer()</code> call.
          Build custom layers on <code>useMapLayer()</code> instead (or just use
          the layer components, which already do this for you): both re-add
          themselves on the <code>"styledata"</code> event after every style
          swap.
        </Typography>
        <CodeBlock code={layersVanishCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Hover / feature-state highlighting does nothing
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Hover highlighting is implemented with MapLibre feature-state, which
          needs a stable numeric id per feature. Every layer component generates
          one for you automatically (<code>generateId</code>) unless you pass{" "}
          <code>featureId</code> to promote one of your own properties — either
          way, that part is already handled. What's usually missing is opting in
          to the highlight itself:
        </Typography>
        <CodeBlock code={hoverNothingCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Tile errors, or <code>onError</code> firing over and over
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          <code>onError(error, kind)</code> routes every kind of map failure
          through one prop instead of separate listeners:
        </Typography>
        <Table sx={Styles.table}>
          <TableHead>
            <TableRow>
              <TableCell>kind</TableCell>
              <TableCell>Fires when</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {errorKinds.map((row) => (
              <TableRow key={row.kind}>
                <TableCell>
                  <code>{row.kind}</code>
                </TableCell>
                <TableCell>{row.when}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Tile errors are the one kind that dedupes itself — a flaky or blocked
          tile host firing hundreds of 404s calls your handler at most once
          every 5 seconds per source, instead of flooding it:
        </Typography>
        <CodeBlock code={onErrorCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          WebGL context lost
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          A GPU driver reset or a laptop waking from sleep can drop the WebGL
          context out from under a live map. <code>onError</code> fires with
          kind <code>"webgl"</code>, and <code>fallback</code> renders in place
          of the map until the browser restores the context — at which point
          your children (markers, layers, controls) remount from scratch.
        </Typography>
        <CodeBlock code={webglLostCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Menus, tooltips, or the geocoder list vanish in fullscreen
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Fixed in v0.10: control tooltips, <code>ContextMenu</code>, and the
          geocoder result list now portal into the map's own root node instead
          of <code>document.body</code>, so they stay visible when the map (or
          an ancestor) enters the Fullscreen API. If you're building your own
          overlay, use the same primitive:
        </Typography>
        <CodeBlock code={fullscreenOverlayCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Geocoder results list looks clipped in a short map
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          The results popper already uses a fixed positioning strategy so a
          map's <code>overflow: hidden</code> can't clip it — but a genuinely
          short map still doesn't leave visual room for a dropdown to open into.
          Give the map real height.
        </Typography>
        <CodeBlock code={geocoderClippedCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Private / authenticated tile servers
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Rewrite tile, style, glyph, and sprite requests with{" "}
          <code>transformRequest</code> — add an auth header, sign a URL, or
          proxy the host. It's creation-time only (set it before the map
          mounts).
        </Typography>
        <CodeBlock code={transformRequestCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          CJS vs ESM
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          The main <code>zmapgl</code> package ships both <code>import</code>{" "}
          and <code>require</code> conditions, so it works from either module
          system. <code>zmapgl/testing</code> is the exception — it's ESM-only,
          because Vitest's own module refuses to load under{" "}
          <code>require()</code>.
        </Typography>
        <CodeBlock code={cjsEsmCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          React 18 vs 19, MUI 6 vs 7
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Both combinations are tested in CI — a dedicated <code>compat</code>{" "}
          job downgrades a runner to React 18 + MUI 6 and reruns typecheck and
          the full unit suite against it, so the advertised peer range isn't
          just aspirational.
        </Typography>
        <CodeBlock code={compatCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          <code>"use client"</code> in a source-aliased monorepo
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          The built <code>dist</code> carries tsup's <code>"use client"</code>{" "}
          banner, but a workspace that aliases <code>zmapgl</code> straight to{" "}
          <code>packages/zmap/src/index.ts</code> — for hot-reloading a linked
          package, say — never sees a build banner. The directive is written
          directly at the top of the source file too, so it survives either way.
        </Typography>
        <CodeBlock code={useClientCode} />
      </Box>
    </Box>
  );
};

export default TroubleshootingGuidePage;

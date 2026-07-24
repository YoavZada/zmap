// run-zmap driver — launch + drive the zmap docs/showcase app headlessly.
//
// Playwright edition: launches its own headless Chromium with software-WebGL
// flags (no manual Chrome/CDP setup) and waits on real readiness signals —
// the library marks loaded map containers with [data-zmap-loaded] and the
// docs expose instances via window.__zmapMaps() — instead of fixed sleeps.
//
// Prereq: the docs server must be up on $BASE (see run-zmap SKILL.md).
//
// Usage (from tools/e2e, or via `pnpm --filter @zmap/e2e driver`):
//   node driver.mjs shoot            # all pages, light + dark
//   node driver.mjs shoot arcs       # one page by name, light + dark
//   node driver.mjs check clusters   # report mounted marker count
//
// Env: BASE (default http://localhost:5173), OUT (default <repo>/demo-screenshots)
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || "http://localhost:5173";
const OUT = process.env.OUT || resolve(here, "../../demo-screenshots");

// Keep in sync with routes.ts and apps/docs/src/App.tsx.
const ROUTES = [
  ["/", "intro"],
  ["/blocks", "blocks"],
  ["/providers", "providers"],
  ["/markers", "markers"],
  ["/popups", "popups"],
  ["/controls", "controls"],
  ["/geocoder", "geocoder"],
  ["/interaction", "interaction"],
  ["/routes", "routes"],
  ["/arcs", "arcs"],
  ["/clusters", "clusters"],
  ["/layers", "layers"],
  ["/choropleth", "choropleth"],
  ["/hexbins", "hexbins"],
  ["/time", "time"],
  ["/extrusion", "extrusion"],
  ["/api", "api"],
  ["/changelog", "changelog"],
  ["/guides/nextjs", "guide-nextjs"],
  ["/guides/react-map-gl", "guide-react-map-gl"],
  ["/terrain", "terrain"],
  ["/raster", "raster"],
];

// Without these, headless Chromium's WebGL silently renders a blank canvas.
const GL_ARGS = [
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--ignore-gpu-blocklist",
];

// Resolve a route arg to its path. Accepts a bare name ("arcs"), a path
// ("/arcs"), or an MSYS-mangled path ("C:/Program Files/Git/arcs") — Git Bash
// rewrites leading-slash args, so we match on the last path segment.
function resolveRoute(arg) {
  if (!arg) return null;
  const key = arg.split(/[\\/]/).filter(Boolean).pop() || "";
  const hit = ROUTES.find(([p, n]) => n === key || p === `/${key}`);
  return hit ? hit[0] : null;
}

/** Scroll down until a map finishes loading (demos lazy-mount on scroll). */
async function waitForMap(page, timeoutMs = 25000) {
  const deadline = Date.now() + timeoutMs;
  const loaded = page.locator("[data-zmap-loaded]");
  while ((await loaded.count()) === 0) {
    if (Date.now() > deadline) return false;
    await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
    await page.waitForTimeout(300);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  return true;
}

/** Wait for every mounted map to go idle (tiles fetched + rendered). */
async function waitForIdle(page, timeoutMs = 15000) {
  await page.evaluate(
    (t) =>
      Promise.race([
        Promise.all(
          (window.__zmapMaps?.() ?? []).map(
            (m) => new Promise((r) => m.once("idle", r)),
          ),
        ),
        new Promise((r) => setTimeout(r, t)),
      ]),
    timeoutMs,
  );
  await page.waitForTimeout(500); // let the last frame paint
}

async function setMode(page, mode) {
  await page.evaluate(
    (m) => localStorage.setItem("zmap-docs-color-mode", m),
    mode,
  );
}

async function main() {
  const [, , mode = "shoot", routeArg] = process.argv;
  mkdirSync(OUT, { recursive: true });

  try {
    await fetch(BASE);
  } catch {
    throw new Error(
      `docs server not reachable at ${BASE} — start it first: pnpm --filter docs dev --port 5173 --strictPort`,
    );
  }

  const browser = await chromium.launch({ args: GL_ARGS });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 920 },
  });

  const screenshot = async (name) => {
    const path = `${OUT}/${name}.png`;
    await page.screenshot({ path });
    console.log(`  saved ${path}`);
  };

  // Land on the origin once so localStorage is writable before the real run.
  await page.goto(`${BASE}/`);

  if (mode === "check") {
    const route = routeArg ? resolveRoute(routeArg) : "/clusters";
    if (!route) throw new Error(`unknown route: ${routeArg}`);
    await setMode(page, "light");
    await page.goto(BASE + route);
    await waitForMap(page);
    await waitForIdle(page);
    const counts = await page.evaluate(() => ({
      markers: document.querySelectorAll(".maplibregl-marker").length,
      canvas: !!document.querySelector(".maplibregl-canvas"),
      maps: (window.__zmapMaps?.() ?? []).length,
    }));
    console.log(`check ${route}: ${JSON.stringify(counts)}`);
    await page
      .locator(".maplibregl-map")
      .first()
      .scrollIntoViewIfNeeded()
      .catch(() => {});
    await screenshot(`check${route.replace(/\W+/g, "-")}`);
  } else {
    const resolved = routeArg ? resolveRoute(routeArg) : null;
    if (routeArg && !resolved) {
      throw new Error(
        `unknown route: ${routeArg} (try: ${ROUTES.map(([, n]) => n).join(", ")})`,
      );
    }
    const routes = resolved ? ROUTES.filter(([p]) => p === resolved) : ROUTES;
    for (const [route, name] of routes) {
      console.log(`navigating ${route}`);
      for (const theme of ["light", "dark"]) {
        await setMode(page, theme);
        await page.goto(BASE + route);
        const hasMap = await waitForMap(page);
        if (!hasMap) console.log(`  (no map mounted on ${route})`);
        await waitForIdle(page);
        await screenshot(`${name}-${theme}`);
      }
    }
  }

  await browser.close();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

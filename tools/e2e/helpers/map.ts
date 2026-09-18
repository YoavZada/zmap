import { expect, type Locator, type Page } from "@playwright/test";

export type ColorMode = "light" | "dark";

/**
 * Structural view of a maplibre Map — only what the specs touch. The real
 * instances live in the page; these types never cross the evaluate boundary.
 */
export type MapHandle = {
  loaded(): boolean;
  isStyleLoaded(): boolean;
  getZoom(): number;
  getStyle(): {
    layers: Array<{ id: string; type: string }>;
    sources: Record<string, { type: string }>;
  };
};

declare global {
  interface Window {
    /** Installed by apps/docs/src/testRegistry.ts. */
    __zmapMaps: () => MapHandle[];
  }
}

/** Docs color-mode persistence key (apps/docs/src/theme.tsx). */
export const MODE_STORAGE_KEY = "zmap-docs-color-mode";

/**
 * Pin the color mode before any page script runs. The docs fall back to the
 * OS scheme when unset, so tests must always set an explicit mode.
 */
export async function setColorMode(page: Page, mode: ColorMode) {
  await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [
    MODE_STORAGE_KEY,
    mode,
  ] as const);
}

/**
 * Wait for at least `min` loaded maps, nudging the page downward as needed —
 * demos below the fold lazy-mount via IntersectionObserver, so a plain wait
 * would never reveal them. Condition-based: each poll tick checks the current
 * count and, if it's still short, scrolls before the next tick — no fixed
 * sleeps, so this resolves as soon as the maps actually load.
 */
export async function revealMaps(page: Page, min = 1, timeout = 45_000) {
  const loaded = page.locator("[data-zmap-loaded]");
  await expect
    .poll(
      async () => {
        const count = await loaded.count();
        if (count < min) {
          await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
        }
        return count;
      },
      { timeout, intervals: [250] },
    )
    .toBeGreaterThanOrEqual(min);
}

/**
 * Scroll the whole page to the bottom, one half-viewport nudge at a time —
 * useRevealOnScroll is one-shot (a demo never un-mounts once revealed), so
 * this permanently reveals every below-the-fold demo on the page. Used by
 * the a11y scan: with a plain revealMaps(page) (min=1), how many demos
 * happen to be in the DOM — and therefore whether the scan turns up a given
 * demo's violation — depends on scroll/CPU timing, making the gate flaky.
 * Scanning the fully-revealed page is deterministic instead.
 *
 * Condition-based, no fixed sleeps: polls `window.scrollY` and keeps
 * scrolling until two consecutive reads agree (the page stopped advancing —
 * reached the bottom), then waits for the last demo section to actually be
 * visible and, if it holds a map, for that map to finish loading.
 */
export async function revealAllDemos(page: Page, timeout = 60_000) {
  let lastY = -1;
  await expect
    .poll(
      async () => {
        const y = await page.evaluate(() => window.scrollY);
        const stopped = y === lastY;
        lastY = y;
        if (!stopped) {
          await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
        }
        return stopped;
      },
      { timeout, intervals: [250] },
    )
    .toBe(true);

  // Settle: the last-revealed demo may still be mounting its map. The
  // demo-section wrapper exists (as a Skeleton) before its IntersectionObserver
  // fires, so give the canvas a bounded window to appear before deciding this
  // section has no map — a one-shot count() here races the mount and can
  // silently skip the load wait.
  const sections = page.getByTestId("demo-section");
  if ((await sections.count()) === 0) {
    // Pages without demo sections (landing, blocks gallery, API, guides):
    // there is no "last demo" to settle on — if the page mounts any map at
    // all, wait for the first one to load so the scan sees mounted content.
    if (await page.locator(".maplibregl-canvas").count()) {
      await expect(page.locator("[data-zmap-loaded]").first()).toBeAttached({
        timeout: 60_000,
      });
    }
    return;
  }
  const lastDemo = sections.last();
  await expect(lastDemo).toBeVisible();
  const hasCanvas = await expect
    .poll(() => lastDemo.locator(".maplibregl-canvas").count(), {
      timeout: 3_000,
      intervals: [250],
    })
    .toBeGreaterThan(0)
    .then(
      () => true,
      () => false,
    );
  if (hasCanvas) {
    await expect(lastDemo.locator("[data-zmap-loaded]").first()).toBeAttached({
      timeout: 60_000,
    });
  }
}

/**
 * Scroll a demo section (by its anchor id, e.g. "interactive-playground")
 * into view and wait for its map to load. Returns the section locator to
 * scope further queries.
 */
export async function revealDemo(page: Page, anchor: string): Promise<Locator> {
  const demo = page.locator(`#${anchor}`);
  await demo.scrollIntoViewIfNeeded();
  await expect(demo.locator("[data-zmap-loaded]").first()).toBeAttached({
    timeout: 60_000,
  });
  return demo;
}

/**
 * Ids of custom GL layers (zmap-* — every zmap layer component uses that
 * prefix) across all mounted maps, plus a flag for custom geojson sources
 * (which covers demos that pass explicit ids, e.g. GeoJSONLayer).
 */
export async function customGlWork(page: Page) {
  return page.evaluate(() => {
    const maps = window.__zmapMaps?.() ?? [];
    const layerIds: string[] = [];
    let geojsonSources = 0;
    for (const map of maps) {
      if (!map.isStyleLoaded()) continue;
      const style = map.getStyle();
      for (const layer of style.layers) {
        if (layer.id.startsWith("zmap-")) layerIds.push(layer.id);
      }
      for (const source of Object.values(style.sources)) {
        if (source.type === "geojson") geojsonSources += 1;
      }
    }
    return { layerIds, geojsonSources };
  });
}

/** Custom (zmap-*) layer ids on one specific map. */
export async function customLayerIds(page: Page, mapIndex = 0) {
  return page.evaluate((i) => {
    const map = (window.__zmapMaps?.() ?? [])[i];
    if (!map?.isStyleLoaded()) return [];
    return map
      .getStyle()
      .layers.map((l) => l.id)
      .filter((id) => id.startsWith("zmap-"));
  }, mapIndex);
}

/** Total style layer count on one map (basemap + custom). */
export async function layerCount(page: Page, mapIndex = 0) {
  return page.evaluate((i) => {
    const map = (window.__zmapMaps?.() ?? [])[i];
    return map?.isStyleLoaded() ? map.getStyle().layers.length : -1;
  }, mapIndex);
}

export async function mapZoom(page: Page, mapIndex = 0) {
  return page.evaluate((i) => {
    const map = (window.__zmapMaps?.() ?? [])[i];
    return map ? map.getZoom() : -1;
  }, mapIndex);
}

export type PageIssues = { pageErrors: string[]; consoleErrors: string[] };

// Benign noise on a software-GL, real-network map page: tile/resource
// fetch hiccups and GL chatter are not app bugs.
const IGNORED_CONSOLE =
  /Failed to load resource|net::ERR|NetworkError|AbortError|WebGL|GL_|swiftshader|GPU/i;

/**
 * Start collecting uncaught exceptions and console errors. Call before
 * goto; assert the arrays are empty at the end of the test.
 */
export function collectPageIssues(page: Page): PageIssues {
  const issues: PageIssues = { pageErrors: [], consoleErrors: [] };
  page.on("pageerror", (err) => issues.pageErrors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error" && !IGNORED_CONSOLE.test(msg.text())) {
      issues.consoleErrors.push(msg.text());
    }
  });
  return issues;
}

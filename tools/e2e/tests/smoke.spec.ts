import { expect, test } from "@playwright/test";
import {
  collectPageIssues,
  customGlWork,
  revealMaps,
  setColorMode,
  type ColorMode,
} from "../helpers/map";
import { ROUTES } from "../routes";

// Every docs route, light + dark: the page renders, a live WebGL map mounts
// (where one is expected), custom GL work is present on layer routes, and no
// uncaught errors fired. Structure-only — never asserts on tile pixels, so
// slow or missing basemap tiles don't flake the suite.
for (const route of ROUTES) {
  for (const mode of ["light", "dark"] as ColorMode[]) {
    test(`${route.path} renders in ${mode} mode`, async ({ page }) => {
      const issues = collectPageIssues(page);
      await setColorMode(page, mode);
      await page.goto(route.path);

      // Docs chrome is up (also proves the SPA route resolved, not the 404).
      await expect(page.getByTestId("theme-toggle")).toBeVisible();

      if (route.hasMap) {
        await revealMaps(page);
        await expect(page.locator(".maplibregl-canvas").first()).toBeVisible();
      }

      if (route.hasGlLayers) {
        await expect
          .poll(
            async () => {
              const { layerIds, geojsonSources } = await customGlWork(page);
              return layerIds.length + geojsonSources;
            },
            { timeout: 20_000 },
          )
          .toBeGreaterThan(0);
      }

      expect(issues.pageErrors).toEqual([]);
      expect(issues.consoleErrors).toEqual([]);
    });
  }
}

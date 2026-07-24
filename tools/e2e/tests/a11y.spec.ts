import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { revealAllDemos, setColorMode } from "../helpers/map";
import { ROUTES } from "../routes";

// Every docs route, light + dark: zero serious/critical axe violations. Runs
// after revealAllDemos on map routes so the scan sees every demo's mounted
// content (lazy-mounted maps/overlays), not just whichever ones happened to
// scroll into view first — a partial reveal would make the gate's outcome
// depend on scroll/CPU timing instead of the page's actual markup.
for (const route of ROUTES) {
  for (const mode of ["light", "dark"] as const) {
    test(`${route.name} has no serious/critical a11y violations (${mode})`, async ({
      page,
    }) => {
      // Revealing every demo (routes with several map-backed sections, e.g.
      // /interaction, mount several live WebGL contexts at once) plus the
      // axe scan itself take longer than the 60s default under load.
      test.slow();
      await setColorMode(page, mode);
      await page.goto(route.path);
      if (route.hasMap) await revealAllDemos(page);

      const results = await new AxeBuilder({ page })
        // MapLibre's own attribution control ships third-party markup we don't
        // own and can't change (a11y is MapLibre's to fix upstream).
        .exclude(".maplibregl-ctrl-attrib")
        .analyze();
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });
  }
}

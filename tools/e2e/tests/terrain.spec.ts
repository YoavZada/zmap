import { expect, test } from "@playwright/test";
import { revealDemo, setColorMode } from "../helpers/map";

// Structure-only: assert terrain is enabled and the globe toggle flips the
// projection. Never asserts tile pixels (real network; grey basemap is fine).
test("terrain demo enables terrain and toggles globe projection", async ({
  page,
}) => {
  await setColorMode(page, "light");
  await page.goto("/terrain");
  const demo = await revealDemo(page, "globe-and-3d-terrain");

  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const map = (window.__zmapMaps?.() ?? [])[0] as unknown as {
            getTerrain?: () => unknown;
          };
          return map?.getTerrain?.() != null;
        }),
      { timeout: 20_000 },
    )
    .toBe(true);

  // Globe on by default → flip the switch off → mercator.
  await demo.getByLabel("Globe projection").click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const map = (window.__zmapMaps?.() ?? [])[0] as unknown as {
          getProjection?: () => { type?: string };
        };
        return map?.getProjection?.()?.type;
      }),
    )
    .toBe("mercator");
});

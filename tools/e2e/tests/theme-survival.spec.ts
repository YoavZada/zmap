import { expect, test } from "@playwright/test";
import { customLayerIds, revealMaps, setColorMode } from "../helpers/map";

// The central zmap gotcha: colorScheme="auto" theme flips call setStyle(),
// which wipes every custom source and layer. useMapLayer re-adds them on
// styledata/idle — this asserts that actually happens on a real map.
test("custom GL layers survive a theme toggle", async ({ page }) => {
  await setColorMode(page, "light");
  await page.goto("/arcs");
  await revealMaps(page);

  // Children add their layers after the map's load event — wait for the
  // arcs to be in the style before taking the baseline.
  await expect
    .poll(async () => (await customLayerIds(page)).length, { timeout: 20_000 })
    .toBeGreaterThan(0);
  const before = await customLayerIds(page); // the 4 flight arcs

  const markersBefore = await page.locator(".maplibregl-marker").count();
  expect(markersBefore).toBeGreaterThan(0);

  await page.getByTestId("theme-toggle").click();

  // setStyle + re-add is async (styledata/idle events) — poll until every
  // pre-toggle custom layer is back.
  await expect
    .poll(() => customLayerIds(page), { timeout: 20_000 })
    .toEqual(expect.arrayContaining(before));

  // DOM overlays (markers) are unaffected by the style swap.
  expect(await page.locator(".maplibregl-marker").count()).toBe(markersBefore);
});

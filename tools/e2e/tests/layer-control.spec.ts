import { expect, test } from "@playwright/test";
import { layerCount, revealDemo, setColorMode } from "../helpers/map";

// LayerControl renders a checkbox per registered <Layer>; toggling unmounts /
// remounts the overlay's GL layers. Asserted through the map's style layer
// count so it works regardless of the overlay's internal layer ids.
test("LayerControl toggles overlays on and off the map", async ({ page }) => {
  await setColorMode(page, "light");
  await page.goto("/layers");
  const demo = await revealDemo(page, "toggleable-overlays");

  const locations = demo.getByRole("checkbox", { name: "Locations" });
  const regions = demo.getByRole("checkbox", { name: "Sales by region" });
  await expect(locations).toBeChecked();
  await expect(regions).not.toBeChecked();

  // Overlays mount asynchronously after map load — wait for the style to
  // settle before taking the baseline count.
  await expect
    .poll(() => layerCount(page), { timeout: 20_000 })
    .toBeGreaterThan(0);
  const baseline = await layerCount(page);

  await locations.uncheck();
  await expect
    .poll(() => layerCount(page), { timeout: 15_000 })
    .toBeLessThan(baseline);

  await locations.check();
  await expect.poll(() => layerCount(page), { timeout: 15_000 }).toBe(baseline);

  await regions.check();
  await expect
    .poll(() => layerCount(page), { timeout: 15_000 })
    .toBeGreaterThan(baseline);
});

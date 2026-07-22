import { expect, test } from "@playwright/test";
import { mapZoom, revealMaps, setColorMode } from "../helpers/map";

// Cluster bubbles are DOM markers whose content is the point count — a
// numeric text distinguishes a cluster bubble from a single-point dot.
test("clicking a cluster bubble zooms toward its expansion", async ({
  page,
}) => {
  await setColorMode(page, "light");
  await page.goto("/clusters");
  await revealMaps(page);

  const bubbles = page
    .locator(".maplibregl-marker")
    .filter({ hasText: /^\d+$/ });
  await expect(bubbles.first()).toBeVisible({ timeout: 30_000 });

  const zoomBefore = await mapZoom(page);
  await bubbles.first().click();

  // expand() eases to getClusterExpansionZoom() — strictly deeper than now.
  await expect
    .poll(() => mapZoom(page), { timeout: 15_000 })
    .toBeGreaterThan(zoomBefore);
});

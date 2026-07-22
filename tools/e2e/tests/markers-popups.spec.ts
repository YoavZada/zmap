import { expect, test } from "@playwright/test";
import { revealDemo, setColorMode } from "../helpers/map";

test.beforeEach(async ({ page }) => {
  await setColorMode(page, "light");
});

test("marker playground: starts with two pins, map click adds one", async ({
  page,
}) => {
  await page.goto("/markers");
  const demo = await revealDemo(page, "interactive-playground");

  const markers = demo.locator(".maplibregl-marker");
  await expect(markers).toHaveCount(2); // London + Paris

  // Click an empty corner of the map (away from the two pins) to add a pin.
  await demo
    .locator(".maplibregl-canvas")
    .first()
    .click({ position: { x: 40, y: 40 } });
  await expect(markers).toHaveCount(3);
  await expect(demo.getByText("3 markers")).toBeVisible();
});

test("popups: Tokyo opens on load, close works, marker click reopens", async ({
  page,
}) => {
  await page.goto("/popups");
  const demo = await revealDemo(page, "click-to-open-popups");

  const popup = demo.locator(".zmap-popup");
  await expect(popup).toHaveCount(1);
  await expect(popup).toContainText("Tokyo");

  await popup.locator(".maplibregl-popup-close-button").click();
  await expect(popup).toHaveCount(0);

  // Any city marker click opens its popup with MUI content.
  await demo.locator(".maplibregl-marker").first().click();
  await expect(popup).toHaveCount(1);
  await expect(popup.locator(".maplibregl-popup-content")).not.toBeEmpty();
});

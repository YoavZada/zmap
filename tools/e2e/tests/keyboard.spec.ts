import { expect, test } from "@playwright/test";
import { revealDemo, revealMaps, setColorMode } from "../helpers/map";

test("MapControls zoom is keyboard operable", async ({ page }) => {
  await setColorMode(page, "light");
  await page.goto("/controls");
  await revealMaps(page);
  const zoomIn = page.getByRole("button", { name: "Zoom in" }).first();
  await zoomIn.focus();
  await expect(zoomIn).toBeFocused();
  await zoomIn.press("Enter"); // activates without a mouse
});

// Anchor verified against /popups: DemoSection slugifies "Click-to-open
// popups" -> "click-to-open-popups" (see markers-popups.spec.ts). The demo
// (ClickPopups.tsx) opens Tokyo's popup by default, so the real trigger is
// exercised by closing it and reopening via a marker click before testing Esc.
test("Popup closes on Escape and returns focus", async ({ page }) => {
  await setColorMode(page, "light");
  await page.goto("/popups");
  const demo = await revealDemo(page, "click-to-open-popups");

  const popup = demo.locator(".zmap-popup");
  await expect(popup).toHaveCount(1);
  await popup.locator(".maplibregl-popup-close-button").click();
  await expect(popup).toHaveCount(0);

  // Real trigger: clicking a marker opens its popup (Popup.tsx moves focus
  // into the popup content on mount).
  await demo.locator(".maplibregl-marker").first().click();
  await expect(popup).toHaveCount(1);

  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
});

// Anchor verified against /interaction: DemoSection slugifies "Draw tools" ->
// "draw-tools". DrawControl's mode buttons are aria-labeled "Draw point" /
// "Draw line" / "Draw polygon" (DrawControl.tsx). In "point" mode, Space on
// the focused canvas commits a vertex immediately (useDraw.ts's
// onCanvasKeyDown -> placeVertex), so two presses land two point features —
// surfaced structurally via the demo's own "Drawn: N points…" readout
// (DrawToolsDemo.tsx), never a pixel/visual assertion.
test("keyboard vertex placement on the interaction page", async ({ page }) => {
  await setColorMode(page, "light");
  await page.goto("/interaction");
  const demo = await revealDemo(page, "draw-tools");

  await demo.getByRole("button", { name: "Draw point" }).click();
  await demo.locator(".maplibregl-canvas").first().focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Space");

  await expect(demo.getByText(/drawn: 2 points/i)).toBeVisible();
});

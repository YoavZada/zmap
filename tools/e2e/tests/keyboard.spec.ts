import { expect, test } from "@playwright/test";
import { mapZoom, revealDemo, revealMaps, setColorMode } from "../helpers/map";

test("MapControls zoom is keyboard operable", async ({ page }) => {
  await setColorMode(page, "light");
  await page.goto("/controls");
  await revealMaps(page);
  const zoomIn = page.getByRole("button", { name: "Zoom in" }).first();
  await zoomIn.focus();
  await expect(zoomIn).toBeFocused();
  const before = await mapZoom(page);
  await zoomIn.press("Enter"); // activates without a mouse
  // Assert the activation actually zoomed — not just that the key was pressed.
  await expect.poll(() => mapZoom(page)).toBeGreaterThan(before);
});

// Anchor verified against /popups: DemoSection slugifies "Click-to-open
// popups" -> "click-to-open-popups" (see markers-popups.spec.ts). The demo
// (ClickPopups.tsx) opens Tokyo's popup by default and labels every marker
// "Open <city> popup" (aria-label, added for axe's aria-command-name rule) —
// closing Tokyo's popup first, then driving a *different* city purely from
// the keyboard, exercises the real trigger without depending on `cities`'
// array order (a future reorder can't make this accidentally re-target the
// one already open, unlike a bare `.first()`).
test("Popup closes on Escape and returns focus", async ({ page }) => {
  await setColorMode(page, "light");
  await page.goto("/popups");
  const demo = await revealDemo(page, "click-to-open-popups");

  const popup = demo.locator(".zmap-popup");
  await expect(popup).toHaveCount(1); // Tokyo, open by default
  await popup.locator(".maplibregl-popup-close-button").click();
  await expect(popup).toHaveCount(0);

  // Paris's marker (role="button", aria-label from Marker's `label` prop) —
  // distinct from the default-open "Tokyo" so this can't silently no-op.
  const parisMarker = demo.getByRole("button", { name: "Open Paris popup" });
  await parisMarker.focus();
  await expect(parisMarker).toBeFocused();
  await parisMarker.press("Enter"); // Marker re-dispatches Enter/Space as click

  await expect(popup).toHaveCount(1);
  // Popup.tsx sets role="dialog" on its content and moves focus into it once
  // mounted — assert that actually happened, not just that the popup exists.
  const dialog = popup.locator('[role="dialog"]');
  await expect(dialog).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
  // Popup.tsx restores focus to whatever was focused before it opened.
  await expect(parisMarker).toBeFocused();
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

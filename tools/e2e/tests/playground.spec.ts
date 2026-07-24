import { expect, test } from "@playwright/test";
import { setColorMode } from "../helpers/map";

// Structure-only: the page + Sandpack editor chrome render. We do NOT assert
// the preview iframe executes (it bundles from an external CDN — network).
test("playground renders the editor", async ({ page }) => {
  await setColorMode(page, "light");
  await page.goto("/playground");
  await expect(page.getByRole("heading", { name: "Playground" })).toBeVisible();
  // Sandpack renders a CodeMirror editor; assert its container appears.
  await expect(page.locator(".sp-wrapper, .sp-layout").first()).toBeVisible({
    timeout: 20_000,
  });
});

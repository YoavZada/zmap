import { expect, test } from "@playwright/test";
import { revealDemo, setColorMode } from "../helpers/map";

// Drives the offline canned-cities demo (no geocoding network): type, pick a
// result, and assert a marker landed. Structure-only — never tile pixels.
test("GeocoderControl searches and drops a marker on select", async ({
  page,
}) => {
  await setColorMode(page, "light");
  await page.goto("/geocoder");
  const demo = await revealDemo(page, "custom-provider");

  const input = demo.getByRole("combobox");
  await input.click();
  await input.fill("tok");

  // The listbox portals to the body, so query at page level.
  await page.getByRole("option", { name: "Tokyo" }).click();

  await expect(demo.locator(".maplibregl-marker")).toHaveCount(1, {
    timeout: 15_000,
  });
});

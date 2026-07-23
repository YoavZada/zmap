// One-shot: renders og-template.html to apps/docs/public/og.png (2× for
// crispness; 1200×630 logical). Rerun after editing the template.
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../../../apps/docs/public/og.png");

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
await page.goto(pathToFileURL(join(here, "og-template.html")).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();
console.log("wrote", out);

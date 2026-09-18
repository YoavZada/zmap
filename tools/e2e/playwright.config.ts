import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const CI = !!process.env.CI;
// Set by the sharded `e2e` job once `docs-build` has already produced
// apps/docs/dist and uploaded it as an artifact — the shard downloads it and
// only needs to serve it, not rebuild it (rebuilding per-shard would waste
// CI minutes and risk each shard building a slightly different bundle).
const PREBUILT = !!process.env.E2E_PREBUILT;
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

// Hybrid server strategy: locally the suite drives the Vite dev server
// (source-aliased, instant, reuses one you already have running); in CI it
// builds the docs and serves the production bundle through `vite preview`, so
// PRs validate the real artifact. E2E_BASE_URL skips the managed server
// entirely (e.g. to point the suite at a deployed site).
const PORT = CI ? 4173 : 5173;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

// Software-WebGL flags: without swiftshader/ANGLE the MapLibre canvas renders
// blank in headless Chromium.
const GL_ARGS = [
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--ignore-gpu-blocklist",
];

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: CI ? 2 : 0,
  // Map pages hold several software-rendered WebGL contexts each — more
  // workers than this just thrash CPU and produce timeout flakes.
  workers: CI ? 2 : 4,
  // CI shards each run into a separate process (see the e2e job's matrix) —
  // "blob" is Playwright's intermediate format, merged into one HTML report
  // by the e2e-report job. Locally there's only one run, so plain "list" is
  // enough.
  reporter: CI ? [["list"], ["blob"]] : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    launchOptions: { args: GL_ARGS },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: PREBUILT
          ? "pnpm --filter docs preview --port 4173 --strictPort"
          : CI
            ? "pnpm --filter docs build && pnpm --filter docs preview --port 4173 --strictPort"
            : "pnpm --filter docs dev --port 5173 --strictPort",
        url: baseURL,
        reuseExistingServer: !CI,
        timeout: 300_000,
        cwd: repoRoot,
      },
});

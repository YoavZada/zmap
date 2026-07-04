import { defineConfig } from "vitest/config";

// Pure-util tests (*.test.ts) run in node; React-surface tests (*.test.tsx)
// opt into jsdom via a `// @vitest-environment jsdom` docblock. maplibre-gl is
// never loaded for real in tests — React tests mock it (see src/test/).
export default defineConfig({
  test: {
    setupFiles: ["./src/test/setup.ts"],
  },
});

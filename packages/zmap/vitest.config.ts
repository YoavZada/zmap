import { defineConfig } from "vitest/config";

// Pure-util tests (*.test.ts) run in node; React-surface tests (*.test.tsx)
// opt into jsdom via a `// @vitest-environment jsdom` docblock. React tests
// mock maplibre-gl (see src/test/) — except src/ssr.test.tsx, which loads
// the real package in node to prove import safety.
export default defineConfig({
  test: {
    setupFiles: ["./src/test/setup.ts"],
  },
});

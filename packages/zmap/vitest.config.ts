import { defineConfig } from "vitest/config";

// Pure-util tests (*.test.ts) run in node; React-surface tests (*.test.tsx)
// opt into jsdom via a `// @vitest-environment jsdom` docblock. React tests
// mock maplibre-gl (see src/test/) — except src/ssr.test.tsx, which loads
// the real package in node to prove import safety.
export default defineConfig({
  test: {
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      exclude: [
        "src/test/**",
        "src/testing/**",
        "src/**/*.test.*",
        "src/**/index.ts",
        "src/**/*.style.ts",
        "src/global.d.ts",
      ],
      reporter: ["text-summary", "lcov"],
      thresholds: {
        statements: 75,
        branches: 60,
        functions: 65,
        lines: 75,
      },
    },
  },
});

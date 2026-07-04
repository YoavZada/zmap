// Shared vitest setup. Runs for every test file; the stubs only apply in
// jsdom (React-surface tests) and are no-ops for node-env util tests.
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL can't auto-register cleanup without vitest globals — do it explicitly,
// or portaled DOM (markers) leaks across tests.
afterEach(cleanup);

if (typeof window !== "undefined") {
  // React Testing Library drives updates through act().
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;

  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
  }
}

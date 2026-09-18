// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { heIL } from "../../../../locales";
import { setFakeMapConstructError } from "../../../../test/mockMaplibre";
import Map from "../../Map";
import MapErrorPanel from "./MapErrorPanel";

vi.mock("maplibre-gl", () => import("../../../../test/mockMaplibre"));

afterEach(() => {
  setFakeMapConstructError(null);
});

describe("MapErrorPanel", () => {
  it("renders the localized message", () => {
    setFakeMapConstructError(new Error("WebGL unavailable"));
    render(<Map localeText={heIL} />);

    expect(screen.getByText(heIL.mapLoadError)).toBeTruthy();
  });

  it("shows error.message only in DEV", () => {
    // import.meta.env.DEV is a real, shared object property in the vitest
    // module graph (verified empirically: mutating it here is visible to
    // MapErrorPanel's own read of `import.meta.env?.DEV`), so we drive the
    // component's DEV guard directly rather than forcing NODE_ENV — vi.stubEnv
    // only touches process.env and does not affect import.meta.env.DEV/MODE
    // in this vitest version. `env` is typed optional + readonly (this
    // library ships to non-Vite/CJS consumers too — see global.d.ts), so we
    // read through a mutable local view instead of touching that ambient type.
    const env = import.meta.env as { DEV?: boolean } | undefined;
    const originalDev = env?.DEV;
    try {
      if (env) env.DEV = true;
      const { unmount } = render(
        <MapErrorPanel error={new Error("dev-only detail")} />,
      );
      expect(screen.getByText("dev-only detail")).toBeTruthy();
      unmount();

      if (env) env.DEV = false;
      render(<MapErrorPanel error={new Error("prod-hidden detail")} />);
      expect(screen.queryByText("prod-hidden detail")).toBeNull();
    } finally {
      if (env) env.DEV = originalDev;
    }
  });
});

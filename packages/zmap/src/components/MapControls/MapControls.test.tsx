// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapContext } from "../../context/MapContext";
import { LocaleContext } from "../../context/LocaleContext";
import { enUS, heIL } from "../../locales";
import { FakeMap } from "../../test/mockMaplibre";
import MapControls from "./MapControls";

describe("MapControls locale", () => {
  it("renders heIL aria-labels when localeText={heIL}", () => {
    render(
      <MapContext.Provider value={{ map: null, loaded: false }}>
        <LocaleContext.Provider value={{ text: heIL }}>
          <MapControls />
        </LocaleContext.Provider>
      </MapContext.Provider>,
    );

    expect(screen.getByLabelText(heIL.zoomIn)).toBeTruthy();
    expect(screen.getByLabelText(heIL.zoomOut)).toBeTruthy();
    expect(screen.getByLabelText(heIL.resetBearingLabel)).toBeTruthy();
    expect(screen.getByLabelText(heIL.myLocationLabel)).toBeTruthy();
    expect(screen.getByLabelText(heIL.toggleFullscreenLabel)).toBeTruthy();
  });

  it("scale bar formats its label with numberLocale", () => {
    // The "nice number" selection (niceRound) always lands the km branch on
    // an exact multiple of 1000 (nice ∈ {1,2,3,5} × a power of ten ≥ 1000),
    // so this math can never surface a fractional km value — we assert the
    // de-DE grouping separator instead, per the task brief's fallback.
    const map = new FakeMap();
    Object.defineProperty(map.getContainer(), "clientHeight", {
      value: 100,
      configurable: true,
    });
    vi.spyOn(map, "unproject").mockImplementation(
      () =>
        ({
          lng: 0,
          lat: 0,
          distanceTo: () => 1_800_000,
        }) as unknown as ReturnType<FakeMap["unproject"]>,
    );

    render(
      <MapContext.Provider value={{ map: map as never, loaded: true }}>
        <LocaleContext.Provider value={{ text: enUS, locale: "de-DE" }}>
          <MapControls showScale scaleUnit="metric" />
        </LocaleContext.Provider>
      </MapContext.Provider>,
    );

    expect(screen.getByText("1.000 km")).toBeTruthy();
  });
});

// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { MapContext } from "../../context/MapContext";
import { LocaleContext } from "../../context/LocaleContext";
import { enUS, heIL } from "../../locales";
import { FakeMap } from "../../test/mockMaplibre";
import MapControls from "./MapControls";

/** Renders <MapControls> against a fresh FakeMap, wired through the same
 * context <Map> provides. Returns the map so tests can drive/assert on it. */
function renderWithMap(element: ReactElement) {
  const map = new FakeMap();
  const utils = render(
    <MapContext.Provider value={{ map: map as never, loaded: true }}>
      <LocaleContext.Provider value={{ text: enUS }}>
        {element}
      </LocaleContext.Provider>
    </MapContext.Provider>,
  );
  return { map, ...utils };
}

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

describe("MapControls zoom", () => {
  it("zoom buttons call zoomIn/zoomOut", () => {
    const { map } = renderWithMap(<MapControls />);

    fireEvent.click(screen.getByLabelText(enUS.zoomIn));
    expect(map.zoomIn).toHaveBeenCalledTimes(1);
    expect(map.zoomOut).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText(enUS.zoomOut));
    expect(map.zoomOut).toHaveBeenCalledTimes(1);
  });
});

describe("MapControls compass", () => {
  it("rotates with bearing and click resets north", () => {
    const { map, container } = renderWithMap(<MapControls />);

    act(() => {
      map.easeTo({ bearing: 45 });
      map.fire("rotate");
    });

    const compass = container.querySelector(
      '[data-testid="NavigationIcon"]',
    ) as HTMLElement;
    expect(getComputedStyle(compass).transform).toBe("rotate(-45deg)");

    fireEvent.click(screen.getByLabelText(enUS.resetBearingLabel));
    expect(map.resetNorth).toHaveBeenCalledTimes(1);
  });
});

describe("MapControls fullscreen", () => {
  it("requests fullscreen on the map container", () => {
    const { map } = renderWithMap(<MapControls />);
    const requestFullscreen = vi.fn();
    Object.defineProperty(map.getContainer(), "requestFullscreen", {
      value: requestFullscreen,
      configurable: true,
    });

    fireEvent.click(screen.getByLabelText(enUS.toggleFullscreenLabel));
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });
});

describe("MapControls pitch toggle", () => {
  it("eases pitch to pitchAmount and back", () => {
    const { map } = renderWithMap(<MapControls showPitch pitchAmount={60} />);
    const toggle = screen.getByLabelText(enUS.toggleTiltLabel);

    fireEvent.click(toggle);
    expect(map.easeTo).toHaveBeenCalledWith({ pitch: 60 });

    fireEvent.click(toggle);
    expect(map.easeTo).toHaveBeenCalledWith({ pitch: 0 });
  });
});

describe("MapControls scale bar", () => {
  it("renders a nice-rounded label", () => {
    const map = new FakeMap();
    Object.defineProperty(map.getContainer(), "clientHeight", {
      value: 100,
      configurable: true,
    });
    // 900m maps to the nearest "nice" value in {1,2,3,5} x 10^n -> 500m,
    // exercising the sub-1000m (meters, not km) label branch.
    vi.spyOn(map, "unproject").mockImplementation(
      () =>
        ({
          lng: 0,
          lat: 0,
          distanceTo: () => 900,
        }) as unknown as ReturnType<FakeMap["unproject"]>,
    );

    render(
      <MapContext.Provider value={{ map: map as never, loaded: true }}>
        <LocaleContext.Provider value={{ text: enUS }}>
          <MapControls showScale scaleUnit="metric" />
        </LocaleContext.Provider>
      </MapContext.Provider>,
    );

    expect(screen.getByText("500 m")).toBeTruthy();
  });
});

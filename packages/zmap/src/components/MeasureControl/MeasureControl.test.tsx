// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "../../context/MapContext";
import { LocaleContext } from "../../context/LocaleContext";
import { enUS } from "../../locales/enUS";
import { heIL } from "../../locales/heIL";
import { FakeMap } from "../../test/mockMaplibre";
import MeasureControl, { type MeasureControlProps } from "./MeasureControl";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

function renderMeasure(
  map: FakeMap,
  props: Partial<MeasureControlProps> = {},
  locale?: { text: typeof enUS; locale?: string },
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider value={{ map: map as never, loaded: true }}>
      <LocaleContext.Provider value={locale ?? { text: enUS }}>
        {children}
      </LocaleContext.Provider>
    </MapContext.Provider>
  );
  return render(<MeasureControl {...props} />, { wrapper });
}

const click = (map: FakeMap, lng: number, lat: number) =>
  act(() => {
    map.fire("click", { lngLat: { lng, lat } });
  });

const move = (map: FakeMap, lng: number, lat: number) =>
  act(() => {
    map.fire("mousemove", { lngLat: { lng, lat } });
  });

describe("MeasureControl", () => {
  it("shows a live chip with a formatted distance while drawing", () => {
    const map = new FakeMap();
    renderMeasure(map);

    fireEvent.click(screen.getByRole("button", { name: enUS.measureDistance }));
    // Two vertices ~111km apart (1 degree of latitude at the equator).
    click(map, 0, 0);
    move(map, 0, 1);

    const chip = screen.getByText(/km$/);
    expect(chip.textContent).toBe("111.20 km");
  });

  it("does not show a live chip before drawing has enough points", () => {
    const map = new FakeMap();
    renderMeasure(map);

    fireEvent.click(screen.getByRole("button", { name: enUS.measureDistance }));
    expect(screen.queryByText(/km$|m$/)).toBeNull();
  });

  it("completed chip is deletable, and deleting it removes the measurement", () => {
    const map = new FakeMap();
    renderMeasure(map);

    fireEvent.click(screen.getByRole("button", { name: enUS.measureDistance }));
    click(map, 0, 0);
    click(map, 0, 1);
    act(() => {
      map.fire("dblclick", {
        lngLat: { lng: 0, lat: 1 },
        preventDefault: () => {},
      });
    });

    const chip = screen.getByText(/km$/).closest(".MuiChip-root");
    expect(chip).not.toBeNull();
    const deleteIcon = chip!.querySelector(".MuiChip-deleteIcon");
    expect(deleteIcon).not.toBeNull();

    fireEvent.click(deleteIcon!);
    expect(screen.queryByText(/km$/)).toBeNull();
  });

  it("readout uses numberLocale for the number and the locale's unit label", () => {
    const map = new FakeMap();
    renderMeasure(map, {}, { text: heIL, locale: "de-DE" });

    fireEvent.click(screen.getByRole("button", { name: heIL.measureDistance }));
    click(map, 0, 0);
    click(map, 0, 1); // ~111.2 km great-circle distance
    act(() => {
      map.fire("dblclick", {
        lngLat: { lng: 0, lat: 1 },
        preventDefault: () => {},
      });
    });

    const chip = screen.getByText(new RegExp(`${heIL.unitKilometers}$`));
    // de-DE uses a comma decimal separator, unlike the "." from
    // formatDistance's en-US default.
    expect(chip.textContent).toBe(`111,20 ${heIL.unitKilometers}`);
  });
});

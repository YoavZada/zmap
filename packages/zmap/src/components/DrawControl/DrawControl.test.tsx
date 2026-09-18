// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "../../context/MapContext";
import { LocaleContext } from "../../context/LocaleContext";
import { enUS } from "../../locales/enUS";
import { heIL } from "../../locales/heIL";
import { FakeMap } from "../../test/mockMaplibre";
import type { DrawFeature } from "../../hooks/useDraw";
import DrawControl, { type DrawControlProps } from "./DrawControl";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

function renderDraw(map: FakeMap, props: Partial<DrawControlProps> = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(<DrawControl {...props} />, { wrapper });
}

const click = (map: FakeMap, lng: number, lat: number) =>
  act(() => {
    map.fire("click", { lngLat: { lng, lat } });
  });

describe("DrawControl", () => {
  it("arms a mode with aria-pressed, and disarms it on a second click", () => {
    const map = new FakeMap();
    renderDraw(map);

    const pointBtn = screen.getByRole("button", { name: enUS.drawPoint });
    const lineBtn = screen.getByRole("button", { name: enUS.drawLine });
    expect(pointBtn.getAttribute("aria-pressed")).toBe("false");
    expect(lineBtn.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(pointBtn);
    expect(pointBtn.getAttribute("aria-pressed")).toBe("true");
    expect(lineBtn.getAttribute("aria-pressed")).toBe("false");

    // Arming a different tool disarms the first.
    fireEvent.click(lineBtn);
    expect(pointBtn.getAttribute("aria-pressed")).toBe("false");
    expect(lineBtn.getAttribute("aria-pressed")).toBe("true");

    // Clicking the armed tool again disarms it.
    fireEvent.click(lineBtn);
    expect(lineBtn.getAttribute("aria-pressed")).toBe("false");
  });

  it("shows finish/undo only while a multi-vertex shape is mid-draw", () => {
    const map = new FakeMap();
    renderDraw(map);

    expect(screen.queryByLabelText(enUS.finishShape)).toBeNull();
    expect(screen.queryByLabelText(enUS.undoLastPoint)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: enUS.drawLine }));
    // Still idle: a line needs at least one draft vertex to count as "drawing".
    expect(screen.queryByLabelText(enUS.finishShape)).toBeNull();

    click(map, 0, 0);
    expect(screen.getByLabelText(enUS.finishShape)).toBeTruthy();
    expect(screen.getByLabelText(enUS.undoLastPoint)).toBeTruthy();

    fireEvent.click(screen.getByLabelText(enUS.undoLastPoint));
    // Undoing the only draft vertex ends the mid-draw state again.
    expect(screen.queryByLabelText(enUS.finishShape)).toBeNull();
  });

  it("shows a clear button once a shape exists, and clears it on click", () => {
    const onChange = vi.fn();
    const map = new FakeMap();
    renderDraw(map, { onChange });

    expect(screen.queryByLabelText(enUS.clearAll)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: enUS.drawPoint }));
    click(map, 1, 2);

    const clearBtn = screen.getByLabelText(enUS.clearAll);
    expect(clearBtn).toBeTruthy();
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({
        geometry: { type: "Point", coordinates: [1, 2] },
      }),
    ] satisfies DrawFeature[]);

    fireEvent.click(clearBtn);
    expect(screen.queryByLabelText(enUS.clearAll)).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("labels follow localeText", () => {
    const map = new FakeMap();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MapContext.Provider value={{ map: map as never, loaded: true }}>
        <LocaleContext.Provider value={{ text: heIL }}>
          {children}
        </LocaleContext.Provider>
      </MapContext.Provider>
    );
    render(<DrawControl />, { wrapper });

    const pointBtn = screen.getByRole("button", { name: heIL.drawPoint });
    expect(screen.getByRole("button", { name: heIL.drawLine })).toBeTruthy();
    expect(screen.getByRole("button", { name: heIL.drawPolygon })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: heIL.drawLine }));
    click(map, 0, 0);
    expect(screen.getByLabelText(heIL.finishShape)).toBeTruthy();
    expect(screen.getByLabelText(heIL.undoLastPoint)).toBeTruthy();
    expect(screen.getByLabelText(heIL.clearAll)).toBeTruthy();

    // The armed point button from the first assertion is unrelated to the
    // now-armed line tool — sanity-check it stayed unpressed throughout.
    expect(pointBtn.getAttribute("aria-pressed")).toBe("false");
  });
});

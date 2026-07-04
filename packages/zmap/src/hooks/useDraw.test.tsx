// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "../context/MapContext";
import { FakeMap } from "../test/mockMaplibre";
import { useDraw, type UseDrawOptions } from "./useDraw";

vi.mock("maplibre-gl", () => import("../test/mockMaplibre"));

function renderDraw(map: FakeMap, options: UseDrawOptions = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return renderHook(() => useDraw(options), { wrapper });
}

const click = (map: FakeMap, lng: number, lat: number) =>
  map.fire("click", { lngLat: { lng, lat } });

describe("useDraw", () => {
  it("starts idle and ignores clicks with no armed tool", () => {
    const map = new FakeMap();
    const { result } = renderDraw(map);

    expect(result.current.mode).toBeNull();
    act(() => {
      click(map, 1, 2);
    });
    expect(result.current.features).toEqual([]);
    expect(result.current.draft).toEqual([]);
  });

  it("completes a point feature per click and reports it", () => {
    const map = new FakeMap();
    const onCreate = vi.fn();
    const onChange = vi.fn();
    const { result } = renderDraw(map, { onCreate, onChange });

    act(() => {
      result.current.setMode("point");
    });
    act(() => {
      click(map, 1, 2);
    });

    expect(result.current.features).toHaveLength(1);
    const feature = result.current.features[0];
    expect(feature.geometry).toEqual({ type: "Point", coordinates: [1, 2] });
    expect(feature.properties.mode).toBe("point");
    expect(onCreate).toHaveBeenCalledWith(feature);
    expect(onChange).toHaveBeenCalledWith([feature]);
  });

  it("collects line vertices into a draft, then finish() commits a LineString", () => {
    const map = new FakeMap();
    const { result } = renderDraw(map);

    act(() => {
      result.current.setMode("line");
    });
    act(() => {
      click(map, 0, 0);
      click(map, 1, 1);
    });
    expect(result.current.draft).toEqual([
      [0, 0],
      [1, 1],
    ]);
    expect(result.current.isDrawing).toBe(true);

    act(() => {
      result.current.finish();
    });
    expect(result.current.features[0].geometry).toEqual({
      type: "LineString",
      coordinates: [
        [0, 0],
        [1, 1],
      ],
    });
    expect(result.current.draft).toEqual([]);
    expect(result.current.isDrawing).toBe(false);
  });

  it("does not commit a line with fewer than 2 vertices", () => {
    const map = new FakeMap();
    const { result } = renderDraw(map);

    act(() => {
      result.current.setMode("line");
    });
    act(() => {
      click(map, 0, 0);
    });
    act(() => {
      result.current.finish();
    });
    expect(result.current.features).toEqual([]);
    expect(result.current.draft).toEqual([[0, 0]]); // keep drawing
  });

  it("closes a polygon ring and dedupes double-click vertices", () => {
    const map = new FakeMap();
    const { result } = renderDraw(map);

    act(() => {
      result.current.setMode("polygon");
    });
    act(() => {
      click(map, 0, 0);
      click(map, 4, 0);
      click(map, 4, 4);
      click(map, 4, 4); // double-click duplicate
    });
    act(() => {
      map.fire("dblclick", {
        lngLat: { lng: 4, lat: 4 },
        preventDefault: vi.fn(),
      });
    });

    expect(result.current.features[0].geometry).toEqual({
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [4, 0],
          [4, 4],
          [0, 0], // ring closed back to start
        ],
      ],
    });
  });

  it("finishes on Enter and clears the draft on Escape", () => {
    const map = new FakeMap();
    const { result } = renderDraw(map);

    act(() => {
      result.current.setMode("line");
    });
    act(() => {
      click(map, 0, 0);
      click(map, 1, 1);
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });
    expect(result.current.features).toHaveLength(1);

    act(() => {
      click(map, 2, 2);
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.draft).toEqual([]);
    expect(result.current.features).toHaveLength(1); // Escape never deletes
  });

  it("undo drops the last draft vertex, then the last feature", () => {
    const map = new FakeMap();
    const { result } = renderDraw(map);

    act(() => {
      result.current.setMode("point");
    });
    act(() => {
      click(map, 1, 1);
    });
    act(() => {
      result.current.setMode("line");
    });
    act(() => {
      click(map, 0, 0);
    });

    act(() => {
      result.current.undo(); // removes the draft vertex
    });
    expect(result.current.draft).toEqual([]);
    expect(result.current.features).toHaveLength(1);

    act(() => {
      result.current.undo(); // draft empty → removes the point feature
    });
    expect(result.current.features).toEqual([]);
  });

  it("remove(id) deletes one feature; clear() resets everything", () => {
    const map = new FakeMap();
    const onChange = vi.fn();
    const { result } = renderDraw(map, { onChange });

    act(() => {
      result.current.setMode("point");
    });
    act(() => {
      click(map, 1, 1);
      click(map, 2, 2);
    });
    const [first, second] = result.current.features;

    act(() => {
      result.current.remove(first.properties.id);
    });
    expect(result.current.features).toEqual([second]);

    act(() => {
      result.current.clear();
    });
    expect(result.current.features).toEqual([]);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("arming a tool discards the draft; disarming stops drawing", () => {
    const map = new FakeMap();
    const { result } = renderDraw(map);

    act(() => {
      result.current.setMode("line");
    });
    act(() => {
      click(map, 0, 0);
    });
    act(() => {
      result.current.setMode("polygon");
    });
    expect(result.current.draft).toEqual([]);

    act(() => {
      result.current.setMode(null);
    });
    act(() => {
      click(map, 5, 5);
    });
    expect(result.current.draft).toEqual([]);
    expect(result.current.features).toEqual([]);
  });

  it("suspends double-click zoom and sets a crosshair cursor while a multi-vertex tool is armed", () => {
    const map = new FakeMap();
    const { result } = renderDraw(map);

    act(() => {
      result.current.setMode("line");
    });
    expect(map.doubleClickZoom.disable).toHaveBeenCalled();
    expect(map.getCanvas().style.cursor).toBe("crosshair");

    act(() => {
      result.current.setMode(null);
    });
    expect(map.doubleClickZoom.enable).toHaveBeenCalled();
    expect(map.getCanvas().style.cursor).toBe("");
  });

  it("tracks the pointer for the rubber-band preview", () => {
    const map = new FakeMap();
    const { result } = renderDraw(map);

    act(() => {
      result.current.setMode("line");
    });
    act(() => {
      map.fire("mousemove", { lngLat: { lng: 3, lat: 4 } });
    });
    expect(result.current.cursor).toEqual([3, 4]);
  });

  it("unbinds map and window handlers on unmount", () => {
    const map = new FakeMap();
    const { result, unmount } = renderDraw(map);

    act(() => {
      result.current.setMode("point");
    });
    unmount();
    expect(map.handlerCount("click")).toBe(0);
    expect(map.handlerCount("mousemove")).toBe(0);
    expect(map.handlerCount("dblclick")).toBe(0);
  });
});

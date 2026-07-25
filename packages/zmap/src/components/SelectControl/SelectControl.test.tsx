// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import SelectControl from "./SelectControl";
import type { LayerPoint } from "../PointLayer";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const POINTS: LayerPoint[] = [
  { longitude: 0, latitude: 0 },
  { longitude: 50, latitude: 50 },
];

function pressSpace(map: FakeMap) {
  const ev = new KeyboardEvent("keydown", {
    key: " ",
    bubbles: true,
    cancelable: true,
  });
  map.getCanvas().dispatchEvent(ev);
}

describe("SelectControl keyboard box", () => {
  it("selects points inside a two-corner keyboard box", () => {
    const map = new FakeMap();
    // project maps [lng,lat] → screen; give a deterministic projection
    map.project = ((lngLat: [number, number]) => ({
      x: lngLat[0],
      y: lngLat[1],
    })) as never;
    const onSelect = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MapContext.Provider
        value={{ map: map as never, loaded: true }}
        children={children}
      />
    );
    render(
      <SelectControl
        points={POINTS}
        defaultTool="box"
        showToolbar={false}
        onSelect={onSelect}
      />,
      { wrapper },
    );
    // corner 1 at center (-10,-10), corner 2 at center (10,10) → box covers point 0 only
    map.setCenterForTest?.([-10, -10]);
    act(() => pressSpace(map));
    map.setCenterForTest?.([10, 10]);
    act(() => pressSpace(map));
    expect(onSelect).toHaveBeenCalled();
    const [selectedPoints] = onSelect.mock.calls.at(-1)!;
    expect(selectedPoints).toEqual([POINTS[0]]);
  });
});

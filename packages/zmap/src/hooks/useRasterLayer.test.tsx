// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { MapContext } from "../context/MapContext";
import { FakeMap } from "../test/mockMaplibre";
import { useRasterLayer } from "./useRasterLayer";

function wrap(map: FakeMap) {
  return ({ children }: { children: ReactNode }) => (
    <MapContext.Provider value={{ map: map as never, loaded: true }} children={children} />
  );
}

describe("useRasterLayer", () => {
  it("adds a raster source and layer, honoring tileSize and opacity", () => {
    const map = new FakeMap();
    renderHook(
      () =>
        useRasterLayer({
          id: "r",
          tiles: ["https://t/{z}/{x}/{y}.png"],
          tileSize: 512,
          opacity: 0.7,
        }),
      { wrapper: wrap(map) },
    );
    const src = map.getSource("r");
    expect(src?.type).toBe("raster");
    expect(src?.options.tiles).toEqual(["https://t/{z}/{x}/{y}.png"]);
    expect(src?.options.tileSize).toBe(512);
    const layer = map.getLayer("r") as { type: string; paint: Record<string, unknown> };
    expect(layer.type).toBe("raster");
    expect(layer.paint["raster-opacity"]).toBe(0.7);
  });

  it("re-applies paint in place when opacity changes (no map event)", () => {
    const map = new FakeMap();
    const { rerender } = renderHook(
      ({ opacity }) =>
        useRasterLayer({
          id: "r",
          tiles: ["https://t/{z}/{x}/{y}.png"],
          opacity,
        }),
      { wrapper: wrap(map), initialProps: { opacity: 1 } },
    );
    map.setPaintProperty.mockClear();

    rerender({ opacity: 0.4 });
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      "r",
      "raster-opacity",
      0.4,
    );
  });

  it("re-adds after a style swap and removes on unmount", () => {
    const map = new FakeMap();
    const { unmount } = renderHook(
      () => useRasterLayer({ id: "r", tiles: ["https://t/{z}/{x}/{y}.png"] }),
      { wrapper: wrap(map) },
    );
    map.removeSource("r");
    map.removeLayer("r");
    map.fire("styledata");
    expect(map.getSource("r")).toBeTruthy();
    expect(map.getLayer("r")).toBeTruthy();

    unmount();
    expect(map.getSource("r")).toBeUndefined();
    expect(map.getLayer("r")).toBeUndefined();
  });
});

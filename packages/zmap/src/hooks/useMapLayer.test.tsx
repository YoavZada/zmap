// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import type { FeatureCollection } from "geojson";
import { MapContext } from "../context/MapContext";
import { FakeMap } from "../test/mockMaplibre";
import { useMapLayer, type MapLayerConfig } from "./useMapLayer";

vi.mock("maplibre-gl", () => import("../test/mockMaplibre"));

const fc = (n: number): FeatureCollection => ({
  type: "FeatureCollection",
  features: Array.from({ length: n }, (_, i) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [i, i] },
    properties: {},
  })),
});

const baseConfig = (over: Partial<MapLayerConfig> = {}): MapLayerConfig => ({
  id: "src-1",
  data: fc(1),
  layers: [
    {
      id: "layer-1",
      type: "circle",
      paint: { "circle-radius": 4 },
    } as MapLayerConfig["layers"][number],
  ],
  ...over,
});

function renderMapLayer(map: FakeMap, config: MapLayerConfig, loaded = true) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded }}
      children={children}
    />
  );
  return renderHook((cfg: MapLayerConfig) => useMapLayer(cfg), {
    wrapper,
    initialProps: config,
  });
}

describe("useMapLayer", () => {
  it("adds the source and layers once loaded", () => {
    const map = new FakeMap();
    renderMapLayer(map, baseConfig());

    expect(map.getSource("src-1")).toBeDefined();
    expect(map.getSource("src-1")!.type).toBe("geojson");
    expect(map.getLayer("layer-1")).toMatchObject({ source: "src-1" });
  });

  it("does nothing until the map has loaded", () => {
    const map = new FakeMap();
    renderMapLayer(map, baseConfig(), false);

    expect(map.getSource("src-1")).toBeUndefined();
    expect(map.getLayer("layer-1")).toBeUndefined();
  });

  it("passes sourceOptions through and honors beforeId when present", () => {
    const map = new FakeMap();
    map.addLayer({ id: "labels" });
    renderMapLayer(
      map,
      baseConfig({ sourceOptions: { cluster: true }, beforeId: "labels" }),
    );

    expect(map.getSource("src-1")!.options).toMatchObject({ cluster: true });
    expect(map.layerOrder).toEqual(["layer-1", "labels"]);
  });

  it("ignores beforeId when that layer does not exist", () => {
    const map = new FakeMap();
    renderMapLayer(map, baseConfig({ beforeId: "missing" }));
    expect(map.layerOrder).toEqual(["layer-1"]);
  });

  it("re-adds source and layers after a style swap wipes them", () => {
    const map = new FakeMap();
    renderMapLayer(map, baseConfig());

    map.wipeStyle();
    expect(map.getSource("src-1")).toBeUndefined();

    act(() => {
      map.fire("styledata");
    });
    expect(map.getSource("src-1")).toBeDefined();
    expect(map.getLayer("layer-1")).toBeDefined();
  });

  it("waits for the style to finish loading before re-adding", () => {
    const map = new FakeMap();
    renderMapLayer(map, baseConfig());

    map.wipeStyle();
    map.setStyleLoaded(false);
    act(() => {
      map.fire("styledata");
    });
    expect(map.getSource("src-1")).toBeUndefined();

    map.setStyleLoaded(true);
    act(() => {
      map.fire("styledata");
    });
    expect(map.getSource("src-1")).toBeDefined();
  });

  it("updates data in place via setData instead of re-adding", () => {
    const map = new FakeMap();
    const { rerender } = renderMapLayer(map, baseConfig());
    const source = map.getSource("src-1")!;

    rerender(baseConfig({ data: fc(3) }));

    expect(source.setData).toHaveBeenCalledWith(fc(3));
    expect(map.getSource("src-1")).toBe(source); // same source, not re-added
  });

  it("applies paint and layout changes in place", () => {
    const map = new FakeMap();
    const { rerender } = renderMapLayer(map, baseConfig());

    rerender(
      baseConfig({
        layers: [
          {
            id: "layer-1",
            type: "circle",
            paint: { "circle-radius": 9 },
            layout: { visibility: "none" },
          } as MapLayerConfig["layers"][number],
        ],
      }),
    );

    expect(map.setPaintProperty).toHaveBeenCalledWith(
      "layer-1",
      "circle-radius",
      9,
    );
    expect(map.setLayoutProperty).toHaveBeenCalledWith(
      "layer-1",
      "visibility",
      "none",
    );
  });

  it("removes its layers and source on unmount", () => {
    const map = new FakeMap();
    const { unmount } = renderMapLayer(map, baseConfig());

    unmount();
    expect(map.getSource("src-1")).toBeUndefined();
    expect(map.getLayer("layer-1")).toBeUndefined();
    expect(map.handlerCount("styledata")).toBe(0);
  });

  it("tolerates cleanup after the map was torn down", () => {
    const map = new FakeMap();
    const { unmount } = renderMapLayer(map, baseConfig());

    map.remove(); // parent <Map> tore the instance down first
    expect(() => unmount()).not.toThrow();
    // _removed guard means nothing was touched after teardown.
    expect(map.getSource("src-1")).toBeDefined();
  });
});

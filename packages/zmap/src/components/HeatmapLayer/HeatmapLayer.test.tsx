// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import HeatmapLayer, { type HeatmapLayerProps } from "./HeatmapLayer";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const POINTS = [
  { longitude: -0.1, latitude: 51.5 },
  { longitude: 2.35, latitude: 48.86, properties: { weight: 3 } },
];

function renderHeat(map: FakeMap, props: Partial<HeatmapLayerProps> = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(<HeatmapLayer id="heat" points={POINTS} {...props} />, {
    wrapper,
  });
}

describe("HeatmapLayer", () => {
  it("renders one heatmap layer with the default ramp", () => {
    const map = new FakeMap();
    renderHeat(map);

    const layer = map.getLayer("heat-heat")!;
    expect(layer.type).toBe("heatmap");
    const paint = layer.paint as Record<string, unknown>;
    expect(paint["heatmap-weight"]).toBe(1);
    expect(paint["heatmap-radius"]).toBe(20);
    const ramp = paint["heatmap-color"] as unknown[];
    expect(ramp[0]).toBe("interpolate");
    expect(ramp[2]).toEqual(["heatmap-density"]);
  });

  it("weights points by a property when asked", () => {
    const map = new FakeMap();
    renderHeat(map, { weightProperty: "weight" });

    const paint = map.getLayer("heat-heat")!.paint as Record<string, unknown>;
    expect(paint["heatmap-weight"]).toEqual(["get", "weight"]);
  });

  it("builds the ramp from [density, color] stops with palette tokens", () => {
    const map = new FakeMap();
    renderHeat(map, {
      colorRamp: [
        [0, "rgba(0,0,0,0)"],
        [1, "#ff0000"],
      ],
    });

    const paint = map.getLayer("heat-heat")!.paint as Record<string, unknown>;
    expect(paint["heatmap-color"]).toEqual([
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(0,0,0,0)",
      1,
      "#ff0000",
    ]);
  });

  it("still accepts a raw MapLibre expression ramp", () => {
    const map = new FakeMap();
    const expr = [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(0,0,0,0)",
      1,
      "blue",
    ] as HeatmapLayerProps["colorRamp"];
    renderHeat(map, { colorRamp: expr });

    const paint = map.getLayer("heat-heat")!.paint as Record<string, unknown>;
    expect(paint["heatmap-color"]).toBe(expr);
  });

  it("honors beforeId and layerOverrides", () => {
    const map = new FakeMap();
    map.addLayer({ id: "labels" });
    renderHeat(map, {
      beforeId: "labels",
      layerOverrides: { heat: { paint: { "heatmap-intensity": 3 } } },
    });

    expect(map.layerOrder).toEqual(["heat-heat", "labels"]);
    const paint = map.getLayer("heat-heat")!.paint as Record<string, unknown>;
    expect(paint["heatmap-intensity"]).toBe(3);
  });
});

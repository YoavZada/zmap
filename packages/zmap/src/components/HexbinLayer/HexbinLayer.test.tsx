// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import { resetDeprecationWarnings } from "../../utils/deprecation";
import HexbinLayer, { type HexbinLayerProps } from "./HexbinLayer";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

// A tight cluster so every point lands in one bin.
const POINTS = [
  { longitude: 0, latitude: 0 },
  { longitude: 0.01, latitude: 0.01 },
  { longitude: -0.01, latitude: 0.005 },
];

function renderHexbin(map: FakeMap, props: Partial<HexbinLayerProps> = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(<HexbinLayer id="bins" points={POINTS} {...props} />, {
    wrapper,
  });
}

afterEach(() => {
  resetDeprecationWarnings();
  vi.restoreAllMocks();
});

describe("HexbinLayer", () => {
  it("renders flat bins as fill + line layers with defaults", () => {
    const map = new FakeMap();
    renderHexbin(map);

    expect(map.getLayer("bins-fill")!.type).toBe("fill");
    const fill = map.getLayer("bins-fill")!.paint as Record<string, unknown>;
    expect(fill["fill-opacity"]).toBe(0.75);

    const line = map.getLayer("bins-line")!.paint as Record<string, unknown>;
    expect(line["line-width"]).toBe(0.5);
    expect(line["line-opacity"]).toBe(0.4); // now a prop default, not hardcoded
  });

  it("prefers fill/stroke props over deprecated ones and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const map = new FakeMap();
    renderHexbin(map, {
      fillOpacity: 0.9,
      opacity: 0.2,
      strokeColor: "#111111",
      lineColor: "#999999",
      strokeWidth: 2,
      lineWidth: 8,
      strokeOpacity: 0.6,
    });

    const fill = map.getLayer("bins-fill")!.paint as Record<string, unknown>;
    expect(fill["fill-opacity"]).toBe(0.9);
    const line = map.getLayer("bins-line")!.paint as Record<string, unknown>;
    expect(line["line-color"]).toBe("#111111");
    expect(line["line-width"]).toBe(2);
    expect(line["line-opacity"]).toBe(0.6);
    expect(warn).toHaveBeenCalledTimes(3); // opacity, lineColor, lineWidth
  });

  it("renders a single fill-extrusion layer when extruded", () => {
    const map = new FakeMap();
    renderHexbin(map, { extruded: true, fillOpacity: 0.8 });

    const layer = map.getLayer("bins-fill")!;
    expect(layer.type).toBe("fill-extrusion");
    const paint = layer.paint as Record<string, unknown>;
    expect(paint["fill-extrusion-opacity"]).toBe(0.8);
    expect(map.getLayer("bins-line")).toBeUndefined();
  });

  it("applies the fill override to the extruded variant too", () => {
    const map = new FakeMap();
    renderHexbin(map, {
      extruded: true,
      layerOverrides: {
        fill: { paint: { "fill-extrusion-vertical-gradient": false } },
      },
    });

    const paint = map.getLayer("bins-fill")!.paint as Record<string, unknown>;
    expect(paint["fill-extrusion-vertical-gradient"]).toBe(false);
  });

  it("fires onClick with the bin aggregates and the raw event", () => {
    const map = new FakeMap();
    const onClick = vi.fn();
    renderHexbin(map, { onClick });

    const event = { features: [{ properties: { value: 3, count: 3 } }] };
    map.fireLayer("click", "bins-fill", event);

    expect(onClick).toHaveBeenCalledWith({ value: 3, count: 3 }, event);
  });

  it("inserts before an existing layer via beforeId", () => {
    const map = new FakeMap();
    map.addLayer({ id: "labels" });
    renderHexbin(map, { beforeId: "labels" });

    expect(map.layerOrder).toEqual(["bins-fill", "bins-line", "labels"]);
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import type { FeatureCollection } from "geojson";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import { resetDeprecationWarnings } from "../../utils/deprecation";
import ShapeLayer, { type ShapeLayerProps } from "./ShapeLayer";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const DATA: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      },
      properties: { value: 10 },
    },
  ],
};

function renderShape(map: FakeMap, props: Partial<ShapeLayerProps> = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(<ShapeLayer id="shape" data={DATA} {...props} />, { wrapper });
}

afterEach(() => {
  resetDeprecationWarnings();
  vi.restoreAllMocks();
});

describe("ShapeLayer", () => {
  it("renders fill and line layers with defaults", () => {
    const map = new FakeMap();
    renderShape(map);

    expect(map.getLayer("shape-fill")!.type).toBe("fill");
    expect(map.getLayer("shape-line")!.type).toBe("line");
    const line = map.getLayer("shape-line")!.paint as Record<string, unknown>;
    expect(line["line-width"]).toBe(1.5);
    expect(line["line-opacity"]).toBe(1);
  });

  it("prefers stroke* over deprecated line* props and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const map = new FakeMap();
    renderShape(map, {
      strokeColor: "#111111",
      strokeWidth: 4,
      strokeOpacity: 0.5,
      lineColor: "#999999",
      lineWidth: 9,
      lineOpacity: 0.9,
    });

    const paint = map.getLayer("shape-line")!.paint as Record<string, unknown>;
    expect(paint["line-color"]).toBe("#111111");
    expect(paint["line-width"]).toBe(4);
    expect(paint["line-opacity"]).toBe(0.5);
    expect(warn).toHaveBeenCalledTimes(3);
  });

  it("builds a choropleth expression when fillColor is a spec", () => {
    const map = new FakeMap();
    renderShape(map, {
      fillColor: {
        property: "value",
        stops: [
          [0, "#000000"],
          [100, "#ffffff"],
        ],
      },
    });

    const paint = map.getLayer("shape-fill")!.paint as Record<string, unknown>;
    expect(paint["fill-color"]).toEqual([
      "interpolate",
      ["linear"],
      ["get", "value"],
      0,
      "#000000",
      100,
      "#ffffff",
    ]);
  });

  it("fires onClick with the clicked feature and the raw event", () => {
    const map = new FakeMap();
    const onClick = vi.fn();
    renderShape(map, { onClick });

    const feature = { properties: { value: 10 } };
    const event = { features: [feature] };
    map.fireLayer("click", "shape-fill", event);

    expect(onClick).toHaveBeenCalledWith(feature, event);
  });

  it("inserts before an existing layer via beforeId", () => {
    const map = new FakeMap();
    map.addLayer({ id: "labels" });
    renderShape(map, { beforeId: "labels" });

    expect(map.layerOrder).toEqual(["shape-fill", "shape-line", "labels"]);
  });

  it("merges layerOverrides per role", () => {
    const map = new FakeMap();
    renderShape(map, {
      layerOverrides: {
        fill: { paint: { "fill-antialias": false } },
        line: { layout: { "line-cap": "round" } },
      },
    });

    const fill = map.getLayer("shape-fill")!.paint as Record<string, unknown>;
    expect(fill["fill-antialias"]).toBe(false);
    const lineLayout = map.getLayer("shape-line")!.layout as Record<
      string,
      unknown
    >;
    expect(lineLayout["line-cap"]).toBe("round");
  });
});

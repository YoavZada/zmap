// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import type { FeatureCollection } from "geojson";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import { resetDeprecationWarnings } from "../../utils/deprecation";
import ChoroplethLayer, {
  type ChoroplethLayerProps,
} from "./ChoroplethLayer";

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
      properties: { density: 42 },
    },
  ],
};

const STOPS: [number, string][] = [
  [0, "#000000"],
  [100, "#ffffff"],
];

function renderChoropleth(
  map: FakeMap,
  props: Partial<ChoroplethLayerProps> = {},
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(
    <ChoroplethLayer
      id="choro"
      data={DATA}
      property="density"
      stops={STOPS}
      {...props}
    />,
    { wrapper },
  );
}

afterEach(() => {
  resetDeprecationWarnings();
  vi.restoreAllMocks();
});

describe("ChoroplethLayer", () => {
  it("drives the fill from the property + stops", () => {
    const map = new FakeMap();
    renderChoropleth(map);

    const paint = map.getLayer("choro-fill")!.paint as Record<string, unknown>;
    expect(paint["fill-color"]).toEqual([
      "interpolate",
      ["linear"],
      ["get", "density"],
      0,
      "#000000",
      100,
      "#ffffff",
    ]);
    expect(paint["fill-opacity"]).toBe(0.6);
  });

  it("passes stroke props through to the outline layer", () => {
    const map = new FakeMap();
    renderChoropleth(map, {
      strokeColor: "#123456",
      strokeWidth: 3,
      strokeOpacity: 0.4,
    });

    const paint = map.getLayer("choro-line")!.paint as Record<string, unknown>;
    expect(paint["line-color"]).toBe("#123456");
    expect(paint["line-width"]).toBe(3);
    expect(paint["line-opacity"]).toBe(0.4);
  });

  it("warns on deprecated line* props but still honors them", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const map = new FakeMap();
    renderChoropleth(map, { lineColor: "#654321", lineWidth: 2 });

    const paint = map.getLayer("choro-line")!.paint as Record<string, unknown>;
    expect(paint["line-color"]).toBe("#654321");
    expect(paint["line-width"]).toBe(2);
    // ChoroplethLayer warns; ShapeLayer receives only the new props.
    expect(
      warn.mock.calls.every(([msg]) => String(msg).includes("ChoroplethLayer")),
    ).toBe(true);
  });

  it("renders a legend built from the same stops when asked", () => {
    const map = new FakeMap();
    renderChoropleth(map, { legend: { title: "Population density" } });

    expect(screen.getByText("Population density")).toBeTruthy();
  });

  it("forwards beforeId to the underlying layers", () => {
    const map = new FakeMap();
    map.addLayer({ id: "labels" });
    renderChoropleth(map, { beforeId: "labels" });

    expect(map.layerOrder).toEqual(["choro-fill", "choro-line", "labels"]);
  });
});

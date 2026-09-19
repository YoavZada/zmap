// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import type { FeatureCollection } from "geojson";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import GeoJSONLayer, { type GeoJSONLayerProps } from "./GeoJSONLayer";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const DATA: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0],
            [0, 0],
          ],
        ],
      },
    },
  ],
};

function renderLayer(map: FakeMap, props: GeoJSONLayerProps) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(<GeoJSONLayer {...props} />, { wrapper });
}

describe("GeoJSONLayer", () => {
  it("adds the configured source and layers", () => {
    const map = new FakeMap();
    const layers: GeoJSONLayerProps["layers"] = [
      { id: "geo-fill", type: "fill", paint: { "fill-color": "#ff0000" } },
    ];
    renderLayer(map, { id: "geo", data: DATA, layers });

    const source = map.getSource("geo");
    expect(source).toBeDefined();
    expect(source?.type).toBe("geojson");
    expect(source?.data).toEqual(DATA);

    const layer = map.getLayer("geo-fill");
    expect(layer).toBeDefined();
    expect(layer?.type).toBe("fill");
    const paint = layer?.paint as Record<string, unknown> | undefined;
    expect(paint?.["fill-color"]).toBe("#ff0000");
  });

  it("forwards sourceOptions unchanged", () => {
    const map = new FakeMap();
    renderLayer(map, {
      id: "geo",
      data: DATA,
      layers: [{ id: "geo-fill", type: "fill", paint: {} }],
      sourceOptions: { cluster: true, clusterRadius: 40 },
    });

    expect(map.getSource("geo")?.options).toMatchObject({
      cluster: true,
      clusterRadius: 40,
    });
  });

  it("accepts a URL as data", () => {
    const map = new FakeMap();
    const url = "https://example.com/data.geojson";
    renderLayer(map, {
      id: "geo",
      data: url,
      layers: [{ id: "geo-fill", type: "fill", paint: {} }],
    });

    expect(map.getSource("geo")?.data).toBe(url);
  });
});

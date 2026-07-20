// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import type { FeatureCollection } from "geojson";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import { resetDeprecationWarnings } from "../../utils/deprecation";
import ExtrusionLayer, { type ExtrusionLayerProps } from "./ExtrusionLayer";

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
      properties: { height: 120 },
    },
  ],
};

function renderExtrusion(
  map: FakeMap,
  props: Partial<ExtrusionLayerProps> = {},
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(<ExtrusionLayer id="ext" data={DATA} {...props} />, {
    wrapper,
  });
}

afterEach(() => {
  resetDeprecationWarnings();
  vi.restoreAllMocks();
});

describe("ExtrusionLayer", () => {
  it("renders one fill-extrusion layer with defaults", () => {
    const map = new FakeMap();
    renderExtrusion(map);

    const layer = map.getLayer("ext-extrusion")!;
    expect(layer.type).toBe("fill-extrusion");
    const paint = layer.paint as Record<string, unknown>;
    expect(paint["fill-extrusion-height"]).toBe(0);
    expect(paint["fill-extrusion-opacity"]).toBe(0.9);
  });

  it("drives height from heightProperty with a scale", () => {
    const map = new FakeMap();
    renderExtrusion(map, { heightProperty: "height", heightScale: 2 });

    const paint = map.getLayer("ext-extrusion")!.paint as Record<
      string,
      unknown
    >;
    expect(paint["fill-extrusion-height"]).toEqual([
      "*",
      ["coalesce", ["to-number", ["get", "height"]], 0],
      2,
    ]);
  });

  it("prefers fillColor/fillOpacity over deprecated color/opacity and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const map = new FakeMap();
    renderExtrusion(map, {
      fillColor: "#101010",
      color: "#999999",
      fillOpacity: 0.5,
      opacity: 0.1,
    });

    const paint = map.getLayer("ext-extrusion")!.paint as Record<
      string,
      unknown
    >;
    expect(paint["fill-extrusion-color"]).toBe("#101010");
    expect(paint["fill-extrusion-opacity"]).toBe(0.5);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("accepts a choropleth spec through fillColor", () => {
    const map = new FakeMap();
    renderExtrusion(map, {
      fillColor: {
        property: "height",
        stops: [
          [0, "#000000"],
          [200, "#ffffff"],
        ],
      },
    });

    const paint = map.getLayer("ext-extrusion")!.paint as Record<
      string,
      unknown
    >;
    expect(paint["fill-extrusion-color"]).toEqual([
      "interpolate",
      ["linear"],
      ["get", "height"],
      0,
      "#000000",
      200,
      "#ffffff",
    ]);
  });

  it("fires onClick with the clicked feature and the raw event", () => {
    const map = new FakeMap();
    const onClick = vi.fn();
    renderExtrusion(map, { onClick });

    const feature = { properties: { height: 120 } };
    const event = { features: [feature] };
    map.fireLayer("click", "ext-extrusion", event);

    expect(onClick).toHaveBeenCalledWith(feature, event);
  });

  it("honors beforeId and layerOverrides", () => {
    const map = new FakeMap();
    map.addLayer({ id: "labels" });
    renderExtrusion(map, {
      beforeId: "labels",
      layerOverrides: {
        extrusion: { paint: { "fill-extrusion-vertical-gradient": false } },
      },
    });

    expect(map.layerOrder).toEqual(["ext-extrusion", "labels"]);
    const paint = map.getLayer("ext-extrusion")!.paint as Record<
      string,
      unknown
    >;
    expect(paint["fill-extrusion-vertical-gradient"]).toBe(false);
  });
});

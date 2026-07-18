// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import type { LngLatTuple } from "../../utils/geojson";
import Route, { type RouteProps } from "./Route";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const COORDS: LngLatTuple[] = [
  [-0.1, 51.5],
  [2.35, 48.86],
];

function renderRoute(map: FakeMap, props: Partial<RouteProps> = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(<Route id="rt" coordinates={COORDS} {...props} />, {
    wrapper,
  });
}

describe("Route", () => {
  it("renders one line layer with default paint and layout", () => {
    const map = new FakeMap();
    renderRoute(map);

    const layer = map.getLayer("rt-line")!;
    expect(layer.type).toBe("line");
    const paint = layer.paint as Record<string, unknown>;
    expect(paint["line-width"]).toBe(4);
    expect(paint["line-opacity"]).toBe(1);
    expect(paint["line-dasharray"]).toBeUndefined();
    const layout = layer.layout as Record<string, unknown>;
    expect(layout["line-cap"]).toBe("round");
  });

  it("adds a dash pattern when dashed", () => {
    const map = new FakeMap();
    renderRoute(map, { dashed: true });

    const paint = map.getLayer("rt-line")!.paint as Record<string, unknown>;
    expect(paint["line-dasharray"]).toEqual([2, 1.5]);
  });

  it("fires onClick with the raw map event and manages the cursor", () => {
    const map = new FakeMap();
    const onClick = vi.fn();
    renderRoute(map, { onClick });

    const event = { lngLat: { lng: 1, lat: 2 } };
    map.fireLayer("click", "rt-line", event);
    expect(onClick).toHaveBeenCalledWith(event);

    map.fireLayer("mouseenter", "rt-line");
    expect(map.getCanvas().style.cursor).toBe("pointer");
    map.fireLayer("mouseleave", "rt-line");
    expect(map.getCanvas().style.cursor).toBe("");
  });

  it("subscribes no layer events without onClick", () => {
    const map = new FakeMap();
    renderRoute(map);
    expect(map.handlerCount("click", "rt-line")).toBe(0);
  });

  it("honors beforeId and layerOverrides", () => {
    const map = new FakeMap();
    map.addLayer({ id: "labels" });
    renderRoute(map, {
      beforeId: "labels",
      layerOverrides: { line: { paint: { "line-blur": 2 } } },
    });

    expect(map.layerOrder).toEqual(["rt-line", "labels"]);
    const paint = map.getLayer("rt-line")!.paint as Record<string, unknown>;
    expect(paint["line-blur"]).toBe(2);
    expect(paint["line-width"]).toBe(4);
  });
});

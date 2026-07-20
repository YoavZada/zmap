// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import { resetDeprecationWarnings } from "../../utils/deprecation";
import PointLayer, { type PointLayerProps } from "./PointLayer";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const POINTS = [
  { longitude: -0.1, latitude: 51.5 },
  { longitude: 2.35, latitude: 48.86, properties: { name: "Paris" } },
];

function renderPoints(map: FakeMap, props: Partial<PointLayerProps> = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(<PointLayer id="pts" points={POINTS} {...props} />, {
    wrapper,
  });
}

afterEach(() => {
  resetDeprecationWarnings();
  vi.restoreAllMocks();
});

describe("PointLayer", () => {
  it("renders points as one circle layer with default paint", () => {
    const map = new FakeMap();
    renderPoints(map);

    const source = map.getSource("pts")!;
    expect((source.data as { features: unknown[] }).features).toHaveLength(2);

    const layer = map.getLayer("pts-circle")!;
    expect(layer.type).toBe("circle");
    const paint = layer.paint as Record<string, unknown>;
    expect(paint["circle-radius"]).toBe(6);
    expect(paint["circle-opacity"]).toBe(1);
    expect(paint["circle-stroke-opacity"]).toBe(1);
    expect(paint["circle-color"]).toMatch(/^#|^rgb/); // token resolved
  });

  it("prefers fillColor/fillOpacity over deprecated color/opacity and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const map = new FakeMap();
    renderPoints(map, {
      fillColor: "#101010",
      color: "#999999",
      fillOpacity: 0.7,
      opacity: 0.1,
    });

    const paint = map.getLayer("pts-circle")!.paint as Record<string, unknown>;
    expect(paint["circle-color"]).toBe("#101010");
    expect(paint["circle-opacity"]).toBe(0.7);
    expect(warn).toHaveBeenCalledTimes(2); // color + opacity, once each
  });

  it("still honors the deprecated props when the new ones are absent", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const map = new FakeMap();
    renderPoints(map, { color: "#abcdef", opacity: 0.3 });

    const paint = map.getLayer("pts-circle")!.paint as Record<string, unknown>;
    expect(paint["circle-color"]).toBe("#abcdef");
    expect(paint["circle-opacity"]).toBe(0.3);
  });

  it("fires onClick with the point, its index, and the raw event", () => {
    const map = new FakeMap();
    const onClick = vi.fn();
    renderPoints(map, { onClick });

    const event = { features: [{ properties: { _idx: 1 } }] };
    map.fireLayer("click", "pts-circle", event);

    expect(onClick).toHaveBeenCalledWith(POINTS[1], 1, event);
  });

  it("shows a pointer cursor while hovering the layer", () => {
    const map = new FakeMap();
    renderPoints(map, { onClick: vi.fn() });

    map.fireLayer("mouseenter", "pts-circle");
    expect(map.getCanvas().style.cursor).toBe("pointer");
    map.fireLayer("mouseleave", "pts-circle");
    expect(map.getCanvas().style.cursor).toBe("");
  });

  it("inserts before an existing layer via beforeId", () => {
    const map = new FakeMap();
    map.addLayer({ id: "labels" });
    renderPoints(map, { beforeId: "labels" });

    expect(map.layerOrder).toEqual(["pts-circle", "labels"]);
  });

  it("merges layerOverrides.circle into the generated paint", () => {
    const map = new FakeMap();
    renderPoints(map, {
      layerOverrides: { circle: { paint: { "circle-blur": 0.5 } } },
    });

    const paint = map.getLayer("pts-circle")!.paint as Record<string, unknown>;
    expect(paint["circle-blur"]).toBe(0.5);
    expect(paint["circle-radius"]).toBe(6); // generated values kept
  });
});

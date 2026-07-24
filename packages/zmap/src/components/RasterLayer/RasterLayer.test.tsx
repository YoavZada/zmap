// @vitest-environment jsdom
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import RasterLayer from "./RasterLayer";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

function wrap(map: FakeMap) {
  return ({ children }: { children: ReactNode }) => (
    <MapContext.Provider value={{ map: map as never, loaded: true }} children={children} />
  );
}

describe("RasterLayer", () => {
  it("adds a raster source + layer from a url", () => {
    const map = new FakeMap();
    render(<RasterLayer id="r" url="https://t/{z}/{x}/{y}.png" />, { wrapper: wrap(map) });
    expect(map.getSource("r")?.type).toBe("raster");
    expect(map.getLayer("r")).toBeTruthy();
  });

  it("applies layerOverrides to the raster layer", () => {
    const map = new FakeMap();
    render(
      <RasterLayer
        id="r"
        url="https://t/{z}/{x}/{y}.png"
        layerOverrides={{ raster: { paint: { "raster-saturation": 0.5 } } }}
      />,
      { wrapper: wrap(map) },
    );
    const paint = (map.getLayer("r") as { paint: Record<string, unknown> }).paint;
    expect(paint["raster-saturation"]).toBe(0.5);
  });

  it("auto-generates an id when omitted", () => {
    const map = new FakeMap();
    render(<RasterLayer url="https://t/{z}/{x}/{y}.png" />, { wrapper: wrap(map) });
    const ids = [...map.sources.keys()];
    expect(ids.some((k) => k.startsWith("zmap-raster-"))).toBe(true);
  });
});

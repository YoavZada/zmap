// @vitest-environment jsdom
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import Terrain, { type TerrainProps } from "./Terrain";
import { terrariumDem } from "./Terrain";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

function renderTerrain(map: FakeMap, props: Partial<TerrainProps> = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(<Terrain {...props} />, { wrapper });
}

describe("Terrain", () => {
  it("adds a raster-dem source (default terrarium) and enables terrain", () => {
    const map = new FakeMap();
    renderTerrain(map);
    // one raster-dem source added
    const sources = [...map.sources.values()];
    const dem = sources.find((s) => s.type === "raster-dem");
    expect(dem).toBeTruthy();
    expect(dem?.options.tiles).toEqual([terrariumDem.url]);
    expect(dem?.options.encoding).toBe("terrarium");
    expect(map.setTerrain).toHaveBeenCalledWith(
      expect.objectContaining({ source: dem?.id, exaggeration: 1 }),
    );
  });

  it("honors demSource, encoding, and exaggeration", () => {
    const map = new FakeMap();
    renderTerrain(map, {
      demSource: "https://example.com/{z}/{x}/{y}.png",
      encoding: "mapbox",
      exaggeration: 1.8,
    });
    const dem = [...map.sources.values()].find((s) => s.type === "raster-dem");
    expect(dem?.options.tiles).toEqual(["https://example.com/{z}/{x}/{y}.png"]);
    expect(dem?.options.encoding).toBe("mapbox");
    expect(map.setTerrain).toHaveBeenCalledWith(
      expect.objectContaining({ exaggeration: 1.8 }),
    );
  });

  it("adds a sky when sky is set", () => {
    const map = new FakeMap();
    renderTerrain(map, { sky: true });
    expect(map.setSky).toHaveBeenCalledTimes(1);
  });

  it("re-applies terrain after a style swap", () => {
    const map = new FakeMap();
    renderTerrain(map);
    map.setTerrain.mockClear();
    map.fire("styledata");
    expect(map.setTerrain).toHaveBeenCalled();
  });

  it("re-applies terrain immediately when exaggeration changes (no map event)", () => {
    const map = new FakeMap();
    const { rerender } = renderTerrain(map, { exaggeration: 1 });
    map.setTerrain.mockClear();

    rerender(<Terrain exaggeration={2.5} />);
    expect(map.setTerrain).toHaveBeenCalledWith(
      expect.objectContaining({ exaggeration: 2.5 }),
    );
  });

  it("disables terrain on unmount", () => {
    const map = new FakeMap();
    const { unmount } = renderTerrain(map);
    unmount();
    expect(map.setTerrain).toHaveBeenLastCalledWith(null);
  });

  it("resets the sky on unmount", () => {
    const map = new FakeMap();
    const { unmount } = renderTerrain(map, { sky: true });
    unmount();
    expect(map.setSky).toHaveBeenLastCalledWith(undefined);
  });
});

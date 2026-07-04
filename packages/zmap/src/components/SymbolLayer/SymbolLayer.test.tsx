// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import SymbolLayer, { type SymbolLayerProps } from "./SymbolLayer";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const POINTS = [
  { longitude: -0.1, latitude: 51.5, label: "London" },
  { longitude: 2.35, latitude: 48.86, label: "Paris" },
];

const flush = () => act(async () => {});

function renderSymbols(map: FakeMap, props: Partial<SymbolLayerProps> = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(<SymbolLayer id="cities" points={POINTS} {...props} />, {
    wrapper,
  });
}

describe("SymbolLayer", () => {
  it("renders points as one symbol layer with label-driven text", () => {
    const map = new FakeMap();
    renderSymbols(map);

    const source = map.getSource("cities")!;
    expect(source.type).toBe("geojson");
    expect((source.data as { features: unknown[] }).features).toHaveLength(2);

    const layer = map.getLayer("cities-symbol")!;
    expect(layer.type).toBe("symbol");
    const layout = layer.layout as Record<string, unknown>;
    expect(layout["text-field"]).toEqual(["get", "label"]);
    expect(layout["icon-image"]).toBeUndefined();
    expect(layout["text-font"]).toBeUndefined(); // style default unless set
  });

  it("resolves palette tokens for text and halo colors", () => {
    const map = new FakeMap();
    renderSymbols(map, { color: "primary.main", haloColor: "#123456" });

    const paint = map.getLayer("cities-symbol")!.paint as Record<
      string,
      unknown
    >;
    expect(paint["text-color"]).toMatch(/^#|^rgb/); // token resolved to CSS
    expect(paint["text-halo-color"]).toBe("#123456");
  });

  it("loads and registers the icon image, and re-registers after style swaps", async () => {
    const map = new FakeMap();
    renderSymbols(map, { icon: { src: "https://x.test/pin.png", size: 0.5 } });
    await flush();

    expect(map.loadImage).toHaveBeenCalledWith("https://x.test/pin.png");
    expect(map.hasImage("cities-icon")).toBe(true);
    const layout = map.getLayer("cities-symbol")!.layout as Record<
      string,
      unknown
    >;
    expect(layout["icon-image"]).toBe("cities-icon");
    expect(layout["icon-size"]).toBe(0.5);

    // A style swap wipes images; the styledata listener restores it.
    map.images.clear();
    act(() => {
      map.fire("styledata");
    });
    await flush();
    expect(map.hasImage("cities-icon")).toBe(true);
  });

  it("removes the icon image on unmount", async () => {
    const map = new FakeMap();
    const { unmount } = renderSymbols(map, {
      icon: { src: "https://x.test/pin.png" },
    });
    await flush();
    expect(map.hasImage("cities-icon")).toBe(true);

    unmount();
    expect(map.hasImage("cities-icon")).toBe(false);
    expect(map.getLayer("cities-symbol")).toBeUndefined();
  });

  it("reports clicks with the original point and index", () => {
    const map = new FakeMap();
    const onClick = vi.fn();
    renderSymbols(map, { onClick });

    act(() => {
      map.fireLayer("click", "cities-symbol", {
        features: [{ properties: { _idx: 1 } }],
      });
    });
    expect(onClick).toHaveBeenCalledWith(POINTS[1], 1);
  });
});

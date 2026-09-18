// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "../context/MapContext";
import { FakeMap } from "../test/mockMaplibre";
import { useLayerHover, type LayerHoverOptions } from "./useLayerHover";

vi.mock("maplibre-gl", () => import("../test/mockMaplibre"));

function renderLayerHover(map: FakeMap, options: LayerHoverOptions) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return renderHook(() => useLayerHover(options), { wrapper });
}

const move = (map: FakeMap, id: number | string, props = {}) =>
  map.fireLayer("mousemove", "fill", {
    features: [{ id, properties: props }],
  });

describe("useLayerHover", () => {
  it("calls onHover with the feature on mousemove and null on mouseleave", () => {
    const map = new FakeMap();
    const onHover = vi.fn();
    renderLayerHover(map, { layerIds: ["fill"], sourceId: "states", onHover });

    act(() => {
      move(map, 1, { name: "Ohio" });
    });
    expect(onHover).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 1 }),
      expect.anything(),
    );

    act(() => {
      map.fireLayer("mouseleave", "fill");
    });
    expect(onHover).toHaveBeenLastCalledWith(null, undefined);
  });

  it("mirrors hover into feature-state and clears the previous feature", () => {
    const map = new FakeMap();
    renderLayerHover(map, {
      layerIds: ["fill"],
      sourceId: "states",
      featureState: true,
    });

    act(() => {
      move(map, 1);
    });
    expect(map.getFeatureState({ source: "states", id: 1 })).toEqual({
      hover: true,
    });

    act(() => {
      move(map, 2);
    });
    expect(map.getFeatureState({ source: "states", id: 1 })).toEqual({});
    expect(map.getFeatureState({ source: "states", id: 2 })).toEqual({
      hover: true,
    });
  });

  it("resets its tracked id on styledata so the next mousemove re-applies state", () => {
    const map = new FakeMap();
    const onHover = vi.fn();
    renderLayerHover(map, {
      layerIds: ["fill"],
      sourceId: "states",
      featureState: true,
      onHover,
    });

    act(() => {
      move(map, 1);
    });
    expect(onHover).toHaveBeenCalledTimes(1);

    act(() => {
      map.fire("styledata");
    });
    act(() => {
      move(map, 1);
    });
    expect(onHover).toHaveBeenCalledTimes(2);
    expect(map.getFeatureState({ source: "states", id: 1 })).toEqual({
      hover: true,
    });
  });

  it("subscribes nothing when neither onHover nor featureState is set", () => {
    const map = new FakeMap();
    renderLayerHover(map, { layerIds: ["fill"], sourceId: "states" });

    expect(map.handlerCount("mousemove", "fill")).toBe(0);
    expect(map.handlerCount("mouseleave", "fill")).toBe(0);
  });

  it("dedupes repeated mousemove over the same feature id", () => {
    const map = new FakeMap();
    const onHover = vi.fn();
    renderLayerHover(map, { layerIds: ["fill"], sourceId: "states", onHover });

    act(() => {
      move(map, 1);
      move(map, 1);
      move(map, 1);
    });
    expect(onHover).toHaveBeenCalledTimes(1);
  });

  it("shows and restores a pointer cursor when pointerCursor is enabled (default)", () => {
    const map = new FakeMap();
    renderLayerHover(map, {
      layerIds: ["fill"],
      sourceId: "states",
      onHover: vi.fn(),
    });

    act(() => {
      move(map, 1);
    });
    expect(map.getCanvas().style.cursor).toBe("pointer");

    act(() => {
      map.fireLayer("mouseleave", "fill");
    });
    expect(map.getCanvas().style.cursor).toBe("");
  });

  it("does not touch the cursor when pointerCursor is false", () => {
    const map = new FakeMap();
    renderLayerHover(map, {
      layerIds: ["fill"],
      sourceId: "states",
      onHover: vi.fn(),
      pointerCursor: false,
    });

    act(() => {
      move(map, 1);
    });
    expect(map.getCanvas().style.cursor).toBe("");
  });

  it("does not clear the new hover when a sibling layer's mouseleave arrives late", () => {
    const map = new FakeMap();
    const onHover = vi.fn();
    renderLayerHover(map, {
      layerIds: ["fill", "line"],
      sourceId: "states",
      featureState: true,
      onHover,
    });

    act(() => {
      map.fireLayer("mousemove", "fill", {
        features: [{ id: 2, properties: {} }],
      });
    });
    expect(onHover).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 2 }),
      expect.anything(),
    );

    // The pointer is still over feature 2, just now via the "line"
    // sub-layer's hit area — mousemove on "line" hasn't fired yet, but its
    // stale "mouseleave" (from the pointer leaving "line" as it entered
    // "fill", or vice versa) arrives late. queryRenderedFeatures reports the
    // pointer is still on feature 2, so the hover must not be cleared.
    map.renderedFeatures = [{ id: 2, properties: {} }];
    act(() => {
      map.fireLayer("mouseleave", "line");
    });

    expect(onHover).not.toHaveBeenCalledWith(null, expect.anything());
    expect(map.getFeatureState({ source: "states", id: 2 })).toEqual({
      hover: true,
    });
  });

  it("clears the hover on mouseleave when queryRenderedFeatures is unavailable (fallback)", () => {
    const map = new FakeMap();
    // Simulate a map-like object missing queryRenderedFeatures.
    (
      map as unknown as { queryRenderedFeatures?: unknown }
    ).queryRenderedFeatures = undefined;
    const onHover = vi.fn();
    renderLayerHover(map, {
      layerIds: ["fill", "line"],
      sourceId: "states",
      featureState: true,
      onHover,
    });

    act(() => {
      move(map, 2);
    });
    act(() => {
      map.fireLayer("mouseleave", "line");
    });

    expect(onHover).toHaveBeenLastCalledWith(null, undefined);
    expect(map.getFeatureState({ source: "states", id: 2 })).toEqual({});
  });

  it("cleans up all handlers on unmount", () => {
    const map = new FakeMap();
    const { unmount } = renderLayerHover(map, {
      layerIds: ["fill", "line"],
      sourceId: "states",
      onHover: vi.fn(),
    });

    unmount();
    expect(map.handlerCount("mousemove", "fill")).toBe(0);
    expect(map.handlerCount("mousemove", "line")).toBe(0);
    expect(map.handlerCount("mouseleave", "fill")).toBe(0);
    expect(map.handlerCount("mouseleave", "line")).toBe(0);
    expect(map.handlerCount("styledata")).toBe(0);
  });
});

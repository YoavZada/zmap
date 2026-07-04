// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "../context/MapContext";
import { FakeMap } from "../test/mockMaplibre";
import { useFeatureState, type FeatureStateOptions } from "./useFeatureState";

vi.mock("maplibre-gl", () => import("../test/mockMaplibre"));

const OPTS: FeatureStateOptions = { layer: "fill", source: "states" };

function renderFeatureState(map: FakeMap, options = OPTS) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return renderHook(() => useFeatureState(options), { wrapper });
}

const move = (map: FakeMap, id: number | string, props = {}) =>
  map.fireLayer("mousemove", "fill", {
    features: [{ id, properties: props }],
  });

describe("useFeatureState", () => {
  it("sets hover feature-state and a pointer cursor on the hovered feature", () => {
    const map = new FakeMap();
    const { result } = renderFeatureState(map);

    act(() => {
      move(map, 7, { name: "Ohio" });
    });

    expect(map.getFeatureState({ source: "states", id: 7 })).toEqual({
      hover: true,
    });
    expect(map.getCanvas().style.cursor).toBe("pointer");
    expect(result.current).toMatchObject({ id: 7 });
  });

  it("moves the state to the new feature when hover changes", () => {
    const map = new FakeMap();
    renderFeatureState(map);

    act(() => {
      move(map, 1);
    });
    act(() => {
      move(map, 2);
    });

    expect(map.getFeatureState({ source: "states", id: 1 })).toEqual({});
    expect(map.getFeatureState({ source: "states", id: 2 })).toEqual({
      hover: true,
    });
  });

  it("does not re-set state while the same feature stays hovered", () => {
    const map = new FakeMap();
    renderFeatureState(map);
    const spy = vi.spyOn(map, "setFeatureState");

    act(() => {
      move(map, 1);
      move(map, 1);
      move(map, 1);
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("clears everything on mouseleave", () => {
    const map = new FakeMap();
    const { result } = renderFeatureState(map);

    act(() => {
      move(map, 1);
    });
    act(() => {
      map.fireLayer("mouseleave", "fill");
    });

    expect(map.getFeatureState({ source: "states", id: 1 })).toEqual({});
    expect(map.getCanvas().style.cursor).toBe("");
    expect(result.current).toBeNull();
  });

  it("ignores features without ids (feature-state needs generateId/promoteId)", () => {
    const map = new FakeMap();
    const { result } = renderFeatureState(map);

    act(() => {
      map.fireLayer("mousemove", "fill", { features: [{ properties: {} }] });
    });
    expect(result.current).toBeNull();
    expect(map.featureStates.size).toBe(0);
  });

  it("supports a custom state key and disabling the cursor", () => {
    const map = new FakeMap();
    renderFeatureState(map, {
      ...OPTS,
      stateKey: "active",
      pointerCursor: false,
    });

    act(() => {
      move(map, 3);
    });
    expect(map.getFeatureState({ source: "states", id: 3 })).toEqual({
      active: true,
    });
    expect(map.getCanvas().style.cursor).toBe("");
  });

  it("unbinds and clears state on unmount", () => {
    const map = new FakeMap();
    const { unmount } = renderFeatureState(map);

    act(() => {
      move(map, 5);
    });
    unmount();

    expect(map.getFeatureState({ source: "states", id: 5 })).toEqual({});
    expect(map.handlerCount("mousemove", "fill")).toBe(0);
    expect(map.handlerCount("mouseleave", "fill")).toBe(0);
  });
});

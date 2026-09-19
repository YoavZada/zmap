// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import type { MapLayerMouseEvent } from "maplibre-gl";
import { MapContext } from "../context/MapContext";
import { FakeMap } from "../test/mockMaplibre";
import { useLayerClick } from "./useLayerClick";

vi.mock("maplibre-gl", () => import("../test/mockMaplibre"));

type ClickHandler = (event: MapLayerMouseEvent) => void;

function renderLayerClick(
  map: FakeMap,
  layerId: string,
  handler: ClickHandler | undefined,
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return renderHook(
    (props: { layerId: string; handler: ClickHandler | undefined }) =>
      useLayerClick(props.layerId, props.handler),
    { wrapper, initialProps: { layerId, handler } },
  );
}

describe("useLayerClick", () => {
  it("subscribes click/mouseenter/mouseleave and sets the pointer cursor", () => {
    const map = new FakeMap();
    const onClick = vi.fn();
    renderLayerClick(map, "pts", onClick);

    expect(map.handlerCount("click", "pts")).toBe(1);
    expect(map.handlerCount("mouseenter", "pts")).toBe(1);
    expect(map.handlerCount("mouseleave", "pts")).toBe(1);

    act(() => map.fireLayer("mouseenter", "pts"));
    expect(map.getCanvas().style.cursor).toBe("pointer");

    const event = {
      lngLat: { lng: 1, lat: 2 },
    } as unknown as MapLayerMouseEvent;
    act(() => map.fireLayer("click", "pts", event));
    expect(onClick).toHaveBeenCalledWith(event);
  });

  it("unsubscribes when the handler becomes undefined", () => {
    const map = new FakeMap();
    const onClick = vi.fn();
    const { rerender } = renderLayerClick(map, "pts", onClick);

    expect(map.handlerCount("click", "pts")).toBe(1);
    expect(map.handlerCount("mouseenter", "pts")).toBe(1);
    expect(map.handlerCount("mouseleave", "pts")).toBe(1);

    rerender({ layerId: "pts", handler: undefined });

    expect(map.handlerCount("click", "pts")).toBe(0);
    expect(map.handlerCount("mouseenter", "pts")).toBe(0);
    expect(map.handlerCount("mouseleave", "pts")).toBe(0);
  });

  it("keeps the latest handler without resubscribing", () => {
    const map = new FakeMap();
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderLayerClick(map, "pts", first);
    const subscribed = map.handlerCount("click", "pts");

    rerender({ layerId: "pts", handler: second });
    expect(map.handlerCount("click", "pts")).toBe(subscribed);

    const event = {
      lngLat: { lng: 0, lat: 0 },
    } as unknown as MapLayerMouseEvent;
    act(() => map.fireLayer("click", "pts", event));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("restores the Map cursor prop on leave", () => {
    const map = new FakeMap();
    // Simulate what <Map cursor="crosshair"> already wrote onto the canvas
    // before this layer's hover handlers run.
    map.getCanvas().style.cursor = "crosshair";
    map.getCanvas().dataset.zmapCursor = "crosshair";

    renderLayerClick(map, "pts", vi.fn());

    act(() => map.fireLayer("mouseenter", "pts"));
    expect(map.getCanvas().style.cursor).toBe("pointer");

    act(() => map.fireLayer("mouseleave", "pts"));
    expect(map.getCanvas().style.cursor).toBe("crosshair");
  });
});

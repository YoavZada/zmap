// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { createRef, type FC } from "react";
import type maplibregl from "maplibre-gl";
import { useMapContext } from "../../context/useMap";
import {
  lastFakeMap,
  resetFakeMaps,
  setFakeMapConstructError,
} from "../../test/mockMaplibre";
import Map from "./Map";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const loadMap = () => {
  const map = lastFakeMap();
  act(() => {
    map.fire("load");
  });
  return map;
};

const Probe: FC = () => {
  const { map, loaded } = useMapContext();
  return <div data-testid="probe">{`${!!map}:${loaded}`}</div>;
};

beforeEach(() => {
  resetFakeMaps();
});

describe("Map", () => {
  it("renders children only after the load event", () => {
    render(
      <Map>
        <div data-testid="child" />
      </Map>,
    );
    expect(screen.queryByTestId("child")).toBeNull();

    loadMap();
    expect(screen.getByTestId("child")).toBeDefined();
  });

  it("calls onLoad once with the instance", () => {
    const onLoad = vi.fn();
    render(<Map onLoad={onLoad} />);
    const map = loadMap();

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledWith(map);
  });

  it("marks the container and exposes the instance once loaded", () => {
    const { container } = render(<Map />);
    expect(container.querySelector("[data-zmap-loaded]")).toBeNull();

    const map = loadMap();
    const el = container.querySelector<
      HTMLDivElement & { __zmapMap?: unknown }
    >("[data-zmap-loaded]");
    expect(el).not.toBeNull();
    expect(el?.__zmapMap).toBe(map);
  });

  it("provides { map, loaded } through context", () => {
    render(
      <Map>
        <Probe />
      </Map>,
    );
    loadMap();
    expect(screen.getByTestId("probe").textContent).toBe("true:true");
  });

  it("forwards a ref to the map instance and applies initial camera props", () => {
    const ref = createRef<maplibregl.Map | null>();
    render(<Map ref={ref} center={[10, 20]} zoom={5} />);
    const map = loadMap();

    expect(ref.current).toBe(map as never);
    expect(map.options).toMatchObject({ center: [10, 20], zoom: 5 });
  });

  it("tears the map down on unmount", () => {
    const { unmount } = render(<Map />);
    const map = loadMap();
    unmount();
    expect(map._removed).toBe(true);
  });

  it("swaps the style when colorScheme changes, but not on first render", () => {
    const { rerender } = render(<Map colorScheme="light" />);
    const map = loadMap();
    expect(map.setStyle).not.toHaveBeenCalled();

    rerender(<Map colorScheme="dark" />);
    expect(map.setStyle).toHaveBeenCalledTimes(1);
  });

  it("applies globe projection on load and re-applies after a style swap", () => {
    render(<Map projection="globe" />);
    const map = loadMap();
    expect(map.setProjection).toHaveBeenCalledWith({ type: "globe" });

    map.setProjection.mockClear();
    act(() => {
      map.fire("styledata");
    });
    expect(map.setProjection).toHaveBeenCalledWith({ type: "globe" });
  });

  it("defaults to mercator projection", () => {
    render(<Map />);
    const map = loadMap();
    expect(map.setProjection).toHaveBeenCalledWith({ type: "mercator" });
  });

  it("re-applies projection when the prop changes, without a map event", () => {
    const { rerender } = render(<Map projection="globe" />);
    const map = loadMap();
    expect(map.setProjection).toHaveBeenCalledWith({ type: "globe" });

    map.setProjection.mockClear();
    rerender(<Map projection="mercator" />);
    expect(map.setProjection).toHaveBeenCalledWith({ type: "mercator" });
  });

  describe("event props", () => {
    it("forwards mouse events with their payload", () => {
      const onClick = vi.fn();
      const onContextMenu = vi.fn();
      render(<Map onClick={onClick} onContextMenu={onContextMenu} />);
      const map = loadMap();

      const ev = { lngLat: { lng: 1, lat: 2 } };
      act(() => {
        map.fire("click", ev);
        map.fire("contextmenu", ev);
      });
      expect(onClick).toHaveBeenCalledWith(ev);
      expect(onContextMenu).toHaveBeenCalledWith(ev);
    });

    it("hands camera state to move/zoom handlers", () => {
      const onMoveEnd = vi.fn();
      render(<Map center={[10, 20]} zoom={4} onMoveEnd={onMoveEnd} />);
      const map = loadMap();

      act(() => {
        map.fire("moveend", { type: "moveend" });
      });
      expect(onMoveEnd).toHaveBeenCalledWith(
        { center: [10, 20], zoom: 4, bearing: 0, pitch: 0 },
        { type: "moveend" },
      );
    });

    it("keeps inline handlers fresh without re-subscribing", () => {
      const first = vi.fn();
      const second = vi.fn();
      const { rerender } = render(<Map onClick={first} />);
      const map = loadMap();
      const subscribed = map.handlerCount("click");

      rerender(<Map onClick={second} />);
      expect(map.handlerCount("click")).toBe(subscribed);

      act(() => {
        map.fire("click", { lngLat: { lng: 0, lat: 0 } });
      });
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });
  });

  describe("reactive camera", () => {
    it("eases to a new view", () => {
      const { rerender } = render(<Map center={[0, 0]} zoom={1} />);
      const map = loadMap();

      rerender(
        <Map center={[0, 0]} zoom={1} view={{ center: [10, 20], zoom: 5 }} />,
      );
      expect(map.easeTo).toHaveBeenCalledTimes(1);
      expect(map.easeTo).toHaveBeenCalledWith({ center: [10, 20], zoom: 5 });
    });

    it("skips views that match the current camera (no feedback loops)", () => {
      const { rerender } = render(<Map center={[10, 20]} zoom={5} />);
      const map = loadMap();

      // Same position the camera is already at → no move.
      rerender(
        <Map center={[10, 20]} zoom={5} view={{ center: [10, 20], zoom: 5 }} />,
      );
      expect(map.easeTo).not.toHaveBeenCalled();

      // A new object with identical values → still no move.
      rerender(
        <Map center={[10, 20]} zoom={5} view={{ center: [10, 20], zoom: 5 }} />,
      );
      expect(map.easeTo).not.toHaveBeenCalled();
    });

    it("jumps instead of easing when animate is false", () => {
      const { rerender } = render(<Map animate={false} />);
      const map = loadMap();

      rerender(<Map animate={false} view={{ center: [10, 20] }} />);
      expect(map.jumpTo).toHaveBeenCalledWith({ center: [10, 20] });
      expect(map.easeTo).not.toHaveBeenCalled();
    });

    it("merges AnimationOptions into easeTo", () => {
      const { rerender } = render(<Map animate={{ duration: 100 }} />);
      const map = loadMap();

      rerender(<Map animate={{ duration: 100 }} view={{ zoom: 7 }} />);
      expect(map.easeTo).toHaveBeenCalledWith({ zoom: 7, duration: 100 });
    });

    it("fits bounds when the value changes, not on identity churn", () => {
      const { rerender } = render(<Map />);
      const map = loadMap();

      rerender(
        <Map
          fitBounds={[
            [0, 0],
            [10, 10],
          ]}
          fitBoundsOptions={{ padding: 40 }}
        />,
      );
      expect(map.fitBounds).toHaveBeenCalledTimes(1);
      expect(map.fitBounds).toHaveBeenCalledWith(
        [
          [0, 0],
          [10, 10],
        ],
        { padding: 40 },
      );

      // New array, same values → no refit.
      rerender(
        <Map
          fitBounds={[
            [0, 0],
            [10, 10],
          ]}
          fitBoundsOptions={{ padding: 40 }}
        />,
      );
      expect(map.fitBounds).toHaveBeenCalledTimes(1);

      // Different bounds → refit.
      rerender(
        <Map
          fitBounds={[
            [-5, 0],
            [10, 10],
          ]}
          fitBoundsOptions={{ padding: 40 }}
        />,
      );
      expect(map.fitBounds).toHaveBeenCalledTimes(2);
    });
  });

  it("marks the container as a labeled region", () => {
    const { container } = render(<Map />);
    const region = container.querySelector('[role="region"]');
    expect(region).not.toBeNull();
    expect(region?.getAttribute("aria-label")).toBe("Interactive map");
  });

  describe("error resilience", () => {
    it("renders a themed fallback and calls onError when map creation throws", () => {
      const boom = new Error("WebGL unavailable");
      setFakeMapConstructError(boom);
      const onError = vi.fn();
      const { getByText } = render(<Map onError={onError} />);
      expect(onError).toHaveBeenCalledWith(boom);
      expect(getByText(/unable to load the map/i)).toBeTruthy();
      setFakeMapConstructError(null);
    });

    it("renders a custom fallback on creation failure", () => {
      setFakeMapConstructError(new Error("no gl"));
      const { getByText } = render(
        <Map fallback={<div>custom fallback</div>} />,
      );
      expect(getByText("custom fallback")).toBeTruthy();
      setFakeMapConstructError(null);
    });

    it("forwards runtime map error events to onError", () => {
      const onError = vi.fn();
      render(<Map onError={onError} />);
      const map = lastFakeMap();
      act(() => map.fire("error", { error: new Error("tile 404") }));
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "tile 404" }),
      );
    });
  });

  describe("loader", () => {
    const region = (container: HTMLElement) =>
      container.querySelector('[role="region"]');

    it("shows no loader and no aria-busy by default", () => {
      const { container } = render(<Map />);
      expect(screen.queryByRole("status")).toBeNull();
      expect(region(container)?.getAttribute("aria-busy")).toBeNull();
    });

    it("shows the built-in loader until load, then removes it", async () => {
      const { container } = render(<Map loader />);
      expect(screen.getByRole("status")).toBeDefined();
      expect(region(container)?.getAttribute("aria-busy")).toBe("true");

      loadMap();
      // aria-busy flips synchronously with `loaded`; the loader fades out.
      expect(region(container)?.getAttribute("aria-busy")).toBe("false");
      await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    });

    it("honors loaderProps.variant with a linear bar", () => {
      const { container } = render(
        <Map loader loaderProps={{ variant: "bar" }} />,
      );
      expect(screen.getByRole("progressbar")).toBeDefined();
      expect(container.querySelector(".MuiLinearProgress-root")).not.toBeNull();
    });

    it("renders a custom loader node and unmounts it on load", () => {
      render(<Map loader={<div data-testid="my-loader" />} />);
      expect(screen.getByTestId("my-loader")).toBeDefined();

      loadMap();
      expect(screen.queryByTestId("my-loader")).toBeNull();
    });

    it("shows the error panel, not the loader, on creation failure", () => {
      setFakeMapConstructError(new Error("no gl"));
      render(<Map loader />);
      expect(screen.getByText(/unable to load the map/i)).toBeTruthy();
      expect(screen.queryByRole("status")).toBeNull();
      setFakeMapConstructError(null);
    });
  });
});

// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { createRef, type FC } from "react";
import type maplibregl from "maplibre-gl";
import maplibreglRuntime from "maplibre-gl";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useMapContext } from "../../context/useMap";
import { usePortalContainer } from "../../context/usePortalContainer";
import {
  fakeMaps,
  lastFakeMap,
  resetFakeMaps,
  setFakeMapConstructError,
} from "../../test/mockMaplibre";
import PointLayer from "../PointLayer";
import { DEFAULT_RTL_TEXT_PLUGIN_URL } from "../../providers/rtlTextPlugin";
import Map, { type MapRef } from "./Map";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const setRTLTextPluginMock =
  maplibreglRuntime.setRTLTextPlugin as unknown as ReturnType<typeof vi.fn>;

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

let probedContainer: HTMLElement | null | undefined;
const PortalContainerProbe: FC = () => {
  probedContainer = usePortalContainer();
  return null;
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

    it("forwards idle, style.load and resize events", () => {
      const onIdle = vi.fn();
      const onStyleLoad = vi.fn();
      const onResize = vi.fn();
      render(
        <Map onIdle={onIdle} onStyleLoad={onStyleLoad} onResize={onResize} />,
      );
      const map = loadMap();

      const idleEv = { type: "idle" };
      const styleLoadEv = { type: "style.load" };
      const resizeEv = { type: "resize" };
      act(() => {
        map.fire("idle", idleEv);
        map.fire("style.load", styleLoadEv);
        map.fire("resize", resizeEv);
      });
      expect(onIdle).toHaveBeenCalledTimes(1);
      expect(onIdle).toHaveBeenCalledWith(idleEv);
      expect(onStyleLoad).toHaveBeenCalledTimes(1);
      expect(onStyleLoad).toHaveBeenCalledWith(styleLoadEv);
      expect(onResize).toHaveBeenCalledTimes(1);
      expect(onResize).toHaveBeenCalledWith(resizeEv);
    });

    it("hands camera state to onZoom", () => {
      const onZoom = vi.fn();
      render(<Map center={[10, 20]} zoom={4} onZoom={onZoom} />);
      const map = loadMap();

      act(() => {
        map.fire("zoom", { type: "zoom" });
      });
      expect(onZoom).toHaveBeenCalledWith(
        { center: [10, 20], zoom: 4, bearing: 0, pitch: 0 },
        { type: "zoom" },
      );
    });

    it("onMouseMove receives the raw event", () => {
      const onMouseMove = vi.fn();
      render(<Map onMouseMove={onMouseMove} />);
      const map = loadMap();

      const ev = { lngLat: { lng: 3, lat: 4 } };
      act(() => {
        map.fire("mousemove", ev);
      });
      expect(onMouseMove).toHaveBeenCalledWith(ev);
    });

    it("keeps the new handlers fresh without resubscribing", () => {
      const first = vi.fn();
      const second = vi.fn();
      const { rerender } = render(<Map onIdle={first} />);
      const map = loadMap();
      const subscribed = map.handlerCount("idle");

      rerender(<Map onIdle={second} />);
      expect(map.handlerCount("idle")).toBe(subscribed);

      act(() => {
        map.fire("idle", { type: "idle" });
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

  it("passes transformRequest, preserveDrawingBuffer, cooperativeGestures, hash, locale, minPitch/maxPitch and maxBounds to the constructor", () => {
    const transformRequest = vi.fn();
    const bounds: [[number, number], [number, number]] = [
      [-10, -10],
      [10, 10],
    ];
    render(
      <Map
        transformRequest={transformRequest}
        preserveDrawingBuffer
        cooperativeGestures
        hash="map"
        locale={{ "AttributionControl.ToggleAttribution": "Toggle" }}
        minPitch={5}
        maxPitch={70}
        maxBounds={bounds}
      />,
    );
    const map = lastFakeMap();
    expect(map.options).toMatchObject({
      transformRequest,
      canvasContextAttributes: { preserveDrawingBuffer: true },
      cooperativeGestures: true,
      hash: "map",
      locale: { "AttributionControl.ToggleAttribution": "Toggle" },
      minPitch: 5,
      maxPitch: 70,
      maxBounds: bounds,
    });
  });

  it("updates min/max zoom, min/max pitch and maxBounds after mount without recreating the map", () => {
    const { rerender } = render(<Map minZoom={1} maxZoom={10} />);
    loadMap();
    expect(fakeMaps.length).toBe(1);

    const bounds: [[number, number], [number, number]] = [
      [-5, -5],
      [5, 5],
    ];
    rerender(
      <Map
        minZoom={2}
        maxZoom={12}
        minPitch={5}
        maxPitch={60}
        maxBounds={bounds}
      />,
    );

    const map = lastFakeMap();
    expect(map.constraints).toMatchObject({
      minZoom: 2,
      maxZoom: 12,
      minPitch: 5,
      maxPitch: 60,
      maxBounds: bounds,
    });
    expect(fakeMaps.length).toBe(1);
  });

  it("toggling interactive disables and re-enables every gesture handler", () => {
    const { rerender } = render(<Map />);
    const map = loadMap();
    const handlers = [
      "dragPan",
      "scrollZoom",
      "boxZoom",
      "dragRotate",
      "keyboard",
      "doubleClickZoom",
      "touchZoomRotate",
      "touchPitch",
    ] as const;

    rerender(<Map interactive={false} />);
    for (const h of handlers) expect(map[h].isEnabled()).toBe(false);

    rerender(<Map interactive />);
    for (const h of handlers) expect(map[h].isEnabled()).toBe(true);
  });

  it("applies cursor to the canvas and useLayerClick restores it on leave", () => {
    const onClick = vi.fn();
    render(
      <Map cursor="crosshair">
        <PointLayer
          id="pts"
          points={[{ longitude: 0, latitude: 0 }]}
          onClick={onClick}
        />
      </Map>,
    );
    const map = loadMap();
    expect(map.getCanvas().style.cursor).toBe("crosshair");

    act(() => map.fireLayer("mouseenter", "pts-circle"));
    expect(map.getCanvas().style.cursor).toBe("pointer");

    act(() => map.fireLayer("mouseleave", "pts-circle"));
    expect(map.getCanvas().style.cursor).toBe("crosshair");
  });

  it("exposes the map instance through ref", () => {
    const ref = createRef<MapRef>();
    render(<Map ref={ref} />);
    const map = loadMap();
    expect(ref.current).toBe(map as never);
  });

  it("marks the container as a labeled region", () => {
    const { container } = render(<Map />);
    const region = container.querySelector('[role="region"]');
    expect(region).not.toBeNull();
    expect(region?.getAttribute("aria-label")).toBe("Interactive map");
  });

  it("aria-label follows localeText.mapLabel", () => {
    const { container } = render(
      <Map localeText={{ mapLabel: "מפה אינטראקטיבית" }} />,
    );
    const region = container.querySelector('[role="region"]');
    expect(region?.getAttribute("aria-label")).toBe("מפה אינטראקטיבית");
  });

  it("provides the container element through usePortalContainer", () => {
    probedContainer = undefined;
    const { container } = render(
      <Map>
        <PortalContainerProbe />
      </Map>,
    );
    loadMap();

    const region = container.querySelector('[role="region"]');
    expect(probedContainer).not.toBeNull();
    expect(probedContainer).toBe(region);
  });

  describe("error resilience", () => {
    it('renders a themed fallback and calls onError with kind "init" when map creation throws', () => {
      const boom = new Error("WebGL unavailable");
      setFakeMapConstructError(boom);
      const onError = vi.fn();
      const { getByText } = render(<Map onError={onError} />);
      expect(onError).toHaveBeenCalledWith(boom, "init");
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

    it('classifies a non-tile error as "runtime"', () => {
      const onError = vi.fn();
      render(<Map onError={onError} />);
      const map = lastFakeMap();
      act(() => map.fire("error", { error: new Error("tile 404") }));
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "tile 404" }),
        "runtime",
      );
    });

    it("dedupes identical tile errors within 5s and reports again after", () => {
      vi.useFakeTimers();
      try {
        const onError = vi.fn();
        render(<Map onError={onError} />);
        const map = lastFakeMap();
        const fireTile = () =>
          act(() => {
            map.fire("error", {
              sourceId: "s",
              error: Object.assign(new Error("404"), { status: 404 }),
            });
          });

        fireTile();
        fireTile();
        fireTile();
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({ message: "404" }),
          "tile",
        );

        act(() => {
          vi.advanceTimersByTime(5001);
        });
        fireTile();
        expect(onError).toHaveBeenCalledTimes(2);
      } finally {
        vi.useRealTimers();
      }
    });

    it("switches to the fallback on webglcontextlost and recovers on restore", () => {
      const onError = vi.fn();
      render(
        <Map onError={onError} fallback={<div>broken</div>}>
          <div data-testid="child" />
        </Map>,
      );
      loadMap();
      const map = lastFakeMap();

      act(() => map.fire("webglcontextlost"));
      expect(screen.getByText("broken")).toBeTruthy();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ name: "WebGLContextLost" }),
        "webgl",
      );

      act(() => map.fire("webglcontextrestored"));
      expect(screen.queryByText("broken")).toBeNull();
      expect(screen.getByTestId("child")).toBeDefined();
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

describe("Map RTL text plugin", () => {
  beforeEach(() => {
    setRTLTextPluginMock.mockClear();
  });

  it("registers the RTL plugin when theme.direction is rtl", () => {
    const theme = createTheme({ direction: "rtl" });
    render(
      <ThemeProvider theme={theme}>
        <Map />
      </ThemeProvider>,
    );
    expect(setRTLTextPluginMock).toHaveBeenCalledTimes(1);
    expect(setRTLTextPluginMock).toHaveBeenCalledWith(
      DEFAULT_RTL_TEXT_PLUGIN_URL,
      true,
    );
  });

  it("skips it for ltr themes", () => {
    const theme = createTheme({ direction: "ltr" });
    render(
      <ThemeProvider theme={theme}>
        <Map />
      </ThemeProvider>,
    );
    expect(setRTLTextPluginMock).not.toHaveBeenCalled();
  });

  it("rtlTextPlugin={false} never registers even under rtl", () => {
    const theme = createTheme({ direction: "rtl" });
    render(
      <ThemeProvider theme={theme}>
        <Map rtlTextPlugin={false} />
      </ThemeProvider>,
    );
    expect(setRTLTextPluginMock).not.toHaveBeenCalled();
  });

  it('rtlTextPlugin="https://x" passes the URL', () => {
    render(<Map rtlTextPlugin="https://x" />);
    expect(setRTLTextPluginMock).toHaveBeenCalledWith("https://x", true);
  });
});

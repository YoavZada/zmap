import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import maplibregl, {
  type AnimationOptions,
  type FitBoundsOptions,
  type GestureOptions,
  type LngLatBoundsLike,
  type Map as MapLibreMap,
  type MapLibreEvent,
  type MapMouseEvent,
  type MapOptions,
  type RequestTransformFunction,
} from "maplibre-gl";
import Box, { type BoxProps } from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import useMediaQuery from "@mui/material/useMediaQuery";
import { MapContext, type MapErrorKind } from "../../context/MapContext";
import { LayerRegistryProvider } from "../../context/LayerRegistryContext";
import { useColorScheme, type ColorScheme } from "../../hooks/useColorScheme";
import { useStyleReapply } from "../../hooks/useStyleReapply";
import { useUpdateEffect } from "../../hooks/useUpdateEffect";
import { providerKey, resolveStyle, type MapStyleInput } from "../../providers";
import { registerPmtilesProtocol, usesPmtiles } from "../../providers/pmtiles";
import { toError } from "../../utils/errors";
import type { LngLatTuple } from "../../utils/geojson";
import MapErrorPanel from "./components/MapErrorPanel";
import MapLoader, { type MapLoaderProps } from "./components/MapLoader";
import Styles from "./map.style";

/** A camera position: center, zoom, bearing, and pitch. */
export interface MapViewState {
  /** Camera center as [longitude, latitude]. */
  center?: LngLatTuple;
  /** Zoom level. */
  zoom?: number;
  /** Camera rotation in degrees (0 = north up). */
  bearing?: number;
  /** Camera tilt in degrees (0 = straight down). */
  pitch?: number;
}

/** A map-level event handler receiving the camera state after the event. */
export type MapViewEventHandler = (
  view: Required<MapViewState>,
  event: MapLibreEvent,
) => void;

/** Props for `<Map>`, the container that creates and configures the MapLibre GL instance. */
export interface MapProps
  extends Omit<
    BoxProps,
    | "onLoad"
    | "ref"
    | "onClick"
    | "onDoubleClick"
    | "onContextMenu"
    | "onError"
    | "onMouseMove"
  > {
  /**
   * Basemap source: a built-in keyless id ("carto" | "osm" | "versatiles" |
   * "opentopomap"), a keyed factory result (`maptiler(key)`, `arcgis(key)`),
   * a custom MapProvider, a raw style URL, or a full MapLibre
   * StyleSpecification. Defaults to "carto".
   */
  provider?: MapStyleInput;
  /** "auto" follows the MUI theme (default); "light"/"dark" force a basemap. */
  colorScheme?: ColorScheme;
  /** Initial camera position. Applied once at creation — use `view` to move the camera later. */
  initialView?: MapViewState;
  /** Shorthand for `initialView.center`. Initial-only, like `initialView`. */
  center?: LngLatTuple;
  /** Shorthand for `initialView.zoom`. Initial-only, like `initialView`. */
  zoom?: number;
  /**
   * Reactive camera position: whenever this prop changes, the map eases to it
   * (only the fields you provide are applied). Unlike `initialView`, the user
   * can still pan/zoom freely between changes — pair with `onMoveEnd` to track
   * where they went. Changes that match the current camera are ignored, so
   * feeding `onMoveEnd`'s view state back into `view` doesn't loop.
   */
  view?: MapViewState;
  /**
   * How `view` changes move the camera: `true` (default) eases with MapLibre's
   * default animation, `false` jumps instantly, or pass `AnimationOptions`
   * (duration, easing…) for a custom transition.
   */
  animate?: boolean | AnimationOptions;
  /**
   * Declarative fitBounds: whenever this prop changes, the camera adjusts to
   * fit the bounds. For one-off imperative moves, use the map ref instead.
   */
  fitBounds?: LngLatBoundsLike;
  /** Options for `fitBounds` (padding, maxZoom…). */
  fitBoundsOptions?: FitBoundsOptions;
  /** Lowest zoom level the camera allows. */
  minZoom?: number;
  /** Highest zoom level the camera allows. */
  maxZoom?: number;
  /** Allow user pan/zoom/rotate. Default true. Reactive. */
  interactive?: boolean;
  /**
   * Let the map wrap/repeat horizontally and scroll forever. Default false —
   * the map shows a single, non-wrapping world (a barrier), instead of the
   * infinite east-west repetition MapLibre renders by default.
   */
  infinite?: boolean;
  /** Hide MapLibre's built-in attribution control (attribute elsewhere). */
  hideAttribution?: boolean;
  /**
   * Rewrite tile, style, glyph and sprite requests — add auth headers, sign
   * URLs, proxy hosts. Creation-time only.
   */
  transformRequest?: RequestTransformFunction;
  /**
   * Keep the WebGL drawing buffer so `map.getCanvas().toDataURL()` works
   * (screenshots/export). Costs some GPU memory. Creation-time only. (Passed
   * to MapLibre as `canvasContextAttributes.preserveDrawingBuffer`.)
   */
  preserveDrawingBuffer?: boolean;
  /** Constrain panning so the viewport stays within these bounds. Reactive. */
  maxBounds?: LngLatBoundsLike;
  /** Lowest allowed camera tilt in degrees (0-85). Reactive. */
  minPitch?: number;
  /** Highest allowed camera tilt in degrees (0-85). Reactive. */
  maxPitch?: number;
  /**
   * Require Ctrl/Cmd + scroll (and two fingers on touch) to zoom — polite for
   * maps embedded in scrolling pages. Creation-time only.
   */
  cooperativeGestures?: boolean | GestureOptions;
  /**
   * Sync the camera to the URL hash (`#zoom/lat/lng/bearing/pitch`); a string
   * uses that query-param name instead. Creation-time only.
   */
  hash?: boolean | string;
  /**
   * Override MapLibre's built-in UI strings (attribution toggle,
   * cooperative-gesture hints, ...). Creation-time only.
   */
  locale?: Record<string, string>;
  /**
   * CSS cursor over the map canvas. Layer hover cursors (pointer) still take
   * precedence while hovering. Reactive.
   */
  cursor?: string;
  /** Escape hatch for any other MapLibre map option. */
  mapOptions?: Partial<MapOptions>;
  /**
   * Map projection. `"globe"` renders the world as a 3D sphere (most visible at
   * low zoom); `"mercator"` is the flat default. Survives theme swaps.
   * @default "mercator"
   */
  projection?: "mercator" | "globe";
  /** Called once with the map instance after the "load" event. */
  onLoad?: (map: maplibregl.Map) => void;
  /**
   * Fired for initialization failures (`"init"`), MapLibre runtime errors
   * (`"runtime"`), failed tile/source requests (`"tile"`, deduped),
   * layer/source spec failures (`"layer"`), style failures (`"style"`), and
   * WebGL context loss (`"webgl"`).
   */
  onError?: (error: Error, kind: MapErrorKind) => void;
  /**
   * Rendered in place of the map when it fails to initialize. Defaults to a
   * themed panel with a "Unable to load the map" message. Also shown while
   * the WebGL context is lost (e.g. a GPU reset or the laptop waking from
   * sleep) — children remount once the context is restored.
   */
  fallback?: ReactNode;
  /**
   * Show a loading indicator while the map initializes. Off by default. Pass
   * `true` for the built-in themed loader, or a ReactNode to render your own
   * indicator instead. Either way it is removed once the map has loaded.
   */
  loader?: boolean | ReactNode;
  /**
   * Configures the built-in loader — variant ("overlay" frosted screen,
   * "spinner", or "bar"), label, controlled `progress` (0–100), and spinner
   * `size`. Ignored when `loader` is a custom ReactNode.
   */
  loaderProps?: MapLoaderProps;
  /** Click on the map. `e.lngLat` has the clicked coordinate. */
  onClick?: (e: MapMouseEvent) => void;
  /** Double-click on the map. */
  onDblClick?: (e: MapMouseEvent) => void;
  /** Right-click / long-press on the map. */
  onContextMenu?: (e: MapMouseEvent) => void;
  /** Fires continuously while the camera moves (pan, zoom, rotate). */
  onMove?: MapViewEventHandler;
  /** Fires once when a camera movement settles. */
  onMoveEnd?: MapViewEventHandler;
  /** Fires once when a zoom gesture/animation settles. */
  onZoomEnd?: MapViewEventHandler;
  /** Fires when the map has finished rendering and no camera transition or tile load is pending — the "settled" signal for screenshots, analytics, or tests. */
  onIdle?: (event: MapLibreEvent) => void;
  /** Fires continuously while zooming (wheel, pinch, buttons). Receives the camera state like `onMove`. */
  onZoom?: MapViewEventHandler;
  /** Fires when a basemap style finishes loading — on first load and after every theme swap. */
  onStyleLoad?: (event: MapLibreEvent) => void;
  /** Pointer movement over the map; `event.lngLat` is the coordinate under the cursor. */
  onMouseMove?: (event: MapMouseEvent) => void;
  /** Fires after the map resized to fit its container (MapLibre already observes the container for you). */
  onResize?: (event: MapLibreEvent) => void;
  /** Map content — rendered once the map has loaded. Typically markers, popups, controls, and layers. */
  children?: ReactNode;
}

/** Snapshot the camera as a fully-populated view state. */
const toViewState = (m: maplibregl.Map): Required<MapViewState> => {
  const c = m.getCenter();
  return {
    center: [c.lng, c.lat],
    zoom: m.getZoom(),
    bearing: m.getBearing(),
    pitch: m.getPitch(),
  };
};

// Gesture handlers toggled by the `interactive` prop — every MapLibre handler
// with an enable()/disable() pair. cooperativeGestures is a separate,
// creation-time-only constructor option and is deliberately not in this list.
const GESTURE_HANDLERS = [
  "dragPan",
  "scrollZoom",
  "boxZoom",
  "dragRotate",
  "keyboard",
  "doubleClickZoom",
  "touchZoomRotate",
  "touchPitch",
] as const;

// Camera deltas below these are treated as "already there" — they're well under
// anything visible, and they break the onMoveEnd → setState → view feedback loop.
const EPS_DEG = 1e-6;
const EPS_CAM = 1e-3;

const matchesCamera = (m: maplibregl.Map, view: MapViewState): boolean => {
  const cur = toViewState(m);
  if (view.center) {
    if (Math.abs(view.center[0] - cur.center[0]) > EPS_DEG) return false;
    if (Math.abs(view.center[1] - cur.center[1]) > EPS_DEG) return false;
  }
  if (view.zoom !== undefined && Math.abs(view.zoom - cur.zoom) > EPS_CAM)
    return false;
  if (
    view.bearing !== undefined &&
    Math.abs(((view.bearing - cur.bearing + 540) % 360) - 180) > EPS_CAM
  )
    return false;
  if (view.pitch !== undefined && Math.abs(view.pitch - cur.pitch) > EPS_CAM)
    return false;
  return true;
};

/** The value a `<Map ref>` receives: the raw MapLibre instance, or `null` before it's created. */
export type MapRef = maplibregl.Map | null;

/**
 * The map container. Creates a MapLibre GL instance, exposes it via context to
 * children (markers, controls, layers…), and swaps the basemap style when the
 * MUI theme mode changes.
 *
 * `ref` receives the raw MapLibre instance once created (`null` before).
 */
const Map = forwardRef<MapRef, MapProps>(function Map(
  {
    provider = "carto",
    colorScheme = "auto",
    initialView,
    center,
    zoom,
    view,
    animate = true,
    fitBounds,
    fitBoundsOptions,
    minZoom,
    maxZoom,
    interactive = true,
    infinite = false,
    hideAttribution = false,
    transformRequest,
    preserveDrawingBuffer,
    maxBounds,
    minPitch,
    maxPitch,
    cooperativeGestures,
    hash,
    locale,
    cursor,
    mapOptions,
    projection = "mercator",
    onLoad,
    onError,
    fallback,
    loader,
    loaderProps,
    onClick,
    onDblClick,
    onContextMenu,
    onMove,
    onMoveEnd,
    onZoomEnd,
    onIdle,
    onZoom,
    onStyleLoad,
    onMouseMove,
    onResize,
    children,
    sx,
    ...boxProps
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mapError, setMapError] = useState<Error | null>(null);

  const mode = useColorScheme(colorScheme);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Keep latest handlers without re-creating the map or re-subscribing.
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  // Stable identity: read the latest onError via the ref above so this never
  // needs to be re-created, and can be included in the memoized context value
  // without ever busting it.
  const reportError = useCallback(
    (error: Error, kind: MapErrorKind) => onErrorRef.current?.(error, kind),
    [],
  );
  // Last-reported timestamp per deduped tile-error key
  // (`${sourceId}|${status}|${message}`) — see the "error" listener below. A
  // plain object (not `Map`): inside this component's own named function
  // expression, the identifier `Map` self-references the component, shadowing
  // the global collection class.
  const tileErrorsRef = useRef<Record<string, number>>({});
  const handlersRef = useRef({
    onClick,
    onDblClick,
    onContextMenu,
    onMove,
    onMoveEnd,
    onZoomEnd,
    onIdle,
    onZoom,
    onStyleLoad,
    onMouseMove,
    onResize,
  });
  handlersRef.current = {
    onClick,
    onDblClick,
    onContextMenu,
    onMove,
    onMoveEnd,
    onZoomEnd,
    onIdle,
    onZoom,
    onStyleLoad,
    onMouseMove,
    onResize,
  };

  // Create the map exactly once.
  // biome-ignore lint/correctness/useExhaustiveDependencies: created once; later prop changes are handled by the effects below
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const resolvedStyle = resolveStyle(provider, mode);

    let cancelled = false;
    let instance: maplibregl.Map | null = null;
    let handleLoad: (() => void) | null = null;

    const create = () => {
      if (cancelled) return;
      try {
        instance = new maplibregl.Map({
          container,
          style: resolvedStyle,
          center: center ?? initialView?.center ?? [0, 20],
          zoom: zoom ?? initialView?.zoom ?? 1.5,
          bearing: initialView?.bearing ?? 0,
          pitch: initialView?.pitch ?? 0,
          minZoom,
          maxZoom,
          minPitch,
          maxPitch,
          maxBounds,
          interactive,
          renderWorldCopies: infinite,
          attributionControl: hideAttribution ? false : undefined,
          transformRequest,
          // preserveDrawingBuffer lives under canvasContextAttributes in the
          // installed maplibre-gl's MapOptions, not as a top-level option.
          canvasContextAttributes:
            preserveDrawingBuffer !== undefined
              ? { preserveDrawingBuffer }
              : undefined,
          cooperativeGestures,
          hash,
          locale,
          ...mapOptions,
        });
      } catch (err) {
        const e = toError(err);
        reportError(e, "init");
        setMapError(e);
        return;
      }
      mapRef.current = instance;
      setMap(instance);
      instance.on("error", (ev: { error?: unknown; sourceId?: string }) => {
        const error = toError(ev?.error ?? new Error("map error"));
        const status = (ev?.error as { status?: unknown })?.status;
        const isTile = ev?.sourceId !== undefined || typeof status === "number";
        if (isTile) {
          const key = `${ev?.sourceId ?? ""}|${status ?? ""}|${error.message}`;
          const now = Date.now();
          const tileErrors = tileErrorsRef.current;
          const last = tileErrors[key];
          if (last !== undefined && now - last < 5000) return;
          tileErrors[key] = now;
          if (Object.keys(tileErrors).length > 200) {
            for (const [k, t] of Object.entries(tileErrors)) {
              if (now - t > 60000) delete tileErrors[k];
            }
          }
          reportError(error, "tile");
          return;
        }
        const kind: MapErrorKind = error.message.toLowerCase().includes("style")
          ? "style"
          : "runtime";
        reportError(error, kind);
      });
      instance.on("webglcontextlost", () => {
        const e = new Error("WebGL context lost");
        e.name = "WebGLContextLost";
        reportError(e, "webgl");
        setMapError(e);
      });
      instance.on("webglcontextrestored", () => setMapError(null));
      handleLoad = () => {
        setLoaded(true);
        // Tooling affordance (e2e, console debugging): mark the container ready
        // and hang the instance off it, so external code can reach the map
        // without React context. Non-enumerable to stay out of DOM iteration.
        container.setAttribute("data-zmap-loaded", "");
        Object.defineProperty(container, "__zmapMap", {
          value: instance,
          configurable: true,
        });
        onLoadRef.current?.(instance as maplibregl.Map);
      };
      instance.on("load", handleLoad);
    };

    if (usesPmtiles(resolvedStyle)) {
      registerPmtilesProtocol()
        .catch((err) => {
          console.warn("zmap: failed to register the pmtiles protocol", err);
        })
        .then(create);
    } else {
      create();
    }

    return () => {
      cancelled = true;
      if (instance) {
        if (handleLoad) instance.off("load", handleLoad);
        container.removeAttribute("data-zmap-loaded");
        delete (container as HTMLDivElement & { __zmapMap?: maplibregl.Map })
          .__zmapMap;
        instance.remove();
      }
      mapRef.current = null;
      setMap(null);
      setLoaded(false);
    };
  }, []);

  // Swap basemap style on provider / color-mode change (skipping the first run,
  // since the initial style is applied at creation). Custom layers re-add
  // themselves via useMapLayer's "styledata" listener.
  const styleKey = `${providerKey(provider)}::${mode}`;
  const firstStyleRun = useRef(true);
  // biome-ignore lint/correctness/useExhaustiveDependencies: styleKey encodes provider + color mode; the raw values are intentionally excluded
  useEffect(() => {
    if (firstStyleRun.current) {
      firstStyleRun.current = false;
      return;
    }
    const instance = mapRef.current;
    if (!instance) return;
    instance.setStyle(resolveStyle(provider, mode));
  }, [styleKey]);

  // Toggle the world barrier when `infinite` changes (skip the first run — it's
  // applied at creation). renderWorldCopies:false shows a single, non-wrapping
  // world instead of MapLibre's default infinite east-west repetition.
  const firstBarrierRun = useRef(true);
  useEffect(() => {
    if (firstBarrierRun.current) {
      firstBarrierRun.current = false;
      return;
    }
    mapRef.current?.setRenderWorldCopies(infinite);
  }, [infinite]);

  // Reactive camera constraints — already applied at creation (see the create
  // effect above); these let them change afterwards without recreating the
  // map. Each skips the mount run via useUpdateEffect.
  useUpdateEffect(() => {
    map?.setMinZoom(minZoom ?? null);
  }, [map, minZoom]);
  useUpdateEffect(() => {
    map?.setMaxZoom(maxZoom ?? null);
  }, [map, maxZoom]);
  useUpdateEffect(() => {
    map?.setMinPitch(minPitch ?? null);
  }, [map, minPitch]);
  useUpdateEffect(() => {
    map?.setMaxPitch(maxPitch ?? null);
  }, [map, maxPitch]);

  // Reactive maxBounds, keyed by value (not identity) so an inline bounds
  // literal doesn't reapply on every render.
  const maxBoundsKey = JSON.stringify(maxBounds ?? null);
  useUpdateEffect(() => {
    map?.setMaxBounds(maxBounds ?? null);
  }, [map, maxBoundsKey]);

  // Reactive `interactive` toggle: enable/disable every gesture handler.
  useUpdateEffect(() => {
    if (!map) return;
    for (const h of GESTURE_HANDLERS) {
      if (interactive) map[h].enable();
      else map[h].disable();
    }
  }, [map, interactive]);

  // CSS cursor over the canvas. Unlike the constraints/interactive effects
  // above, this must also apply on mount (there's no constructor option for
  // it), so it's a plain useEffect rather than useUpdateEffect.
  useEffect(() => {
    if (!map) return;
    const c = map.getCanvas();
    c.style.cursor = cursor ?? "";
    if (cursor) c.dataset.zmapCursor = cursor;
    else delete c.dataset.zmapCursor;
  }, [map, cursor]);

  // Apply the projection on load and re-apply after every style swap
  // (setStyle resets projection to the style's declared default).
  useStyleReapply(
    map,
    loaded,
    useCallback(
      (m: MapLibreMap) => m.setProjection({ type: projection }),
      [projection],
    ),
    undefined,
    useCallback((e: Error) => reportError(e, "style"), [reportError]),
  );

  // Map-level event props. Subscribed once per map instance; the handlers stay
  // fresh through handlersRef, so consumers can pass inline closures freely.
  useEffect(() => {
    if (!map) return;
    const h = handlersRef;
    const onClickEv = (e: MapMouseEvent) => h.current.onClick?.(e);
    const onDblClickEv = (e: MapMouseEvent) => h.current.onDblClick?.(e);
    const onContextMenuEv = (e: MapMouseEvent) => h.current.onContextMenu?.(e);
    const onMoveEv = (e: MapLibreEvent) =>
      h.current.onMove?.(toViewState(map), e);
    const onMoveEndEv = (e: MapLibreEvent) =>
      h.current.onMoveEnd?.(toViewState(map), e);
    const onZoomEndEv = (e: MapLibreEvent) =>
      h.current.onZoomEnd?.(toViewState(map), e);
    const onIdleEv = (e: MapLibreEvent) => h.current.onIdle?.(e);
    const onZoomEv = (e: MapLibreEvent) =>
      h.current.onZoom?.(toViewState(map), e);
    const onStyleLoadEv = (e: MapLibreEvent) => h.current.onStyleLoad?.(e);
    const onMouseMoveEv = (e: MapMouseEvent) => h.current.onMouseMove?.(e);
    const onResizeEv = (e: MapLibreEvent) => h.current.onResize?.(e);

    map.on("click", onClickEv);
    map.on("dblclick", onDblClickEv);
    map.on("contextmenu", onContextMenuEv);
    map.on("move", onMoveEv);
    map.on("moveend", onMoveEndEv);
    map.on("zoomend", onZoomEndEv);
    map.on("idle", onIdleEv);
    map.on("zoom", onZoomEv);
    map.on("style.load", onStyleLoadEv);
    map.on("mousemove", onMouseMoveEv);
    map.on("resize", onResizeEv);
    return () => {
      map.off("click", onClickEv);
      map.off("dblclick", onDblClickEv);
      map.off("contextmenu", onContextMenuEv);
      map.off("move", onMoveEv);
      map.off("moveend", onMoveEndEv);
      map.off("zoomend", onZoomEndEv);
      map.off("idle", onIdleEv);
      map.off("zoom", onZoomEv);
      map.off("style.load", onStyleLoadEv);
      map.off("mousemove", onMouseMoveEv);
      map.off("resize", onResizeEv);
    };
  }, [map]);

  // `animate` steers how camera props move the map but never triggers a move.
  const animateRef = useRef(animate);
  animateRef.current = animate;

  // Reactive camera: ease/jump to `view` when it changes. Depends on the view
  // fields (not object identity) so inline literals don't retrigger, and skips
  // when the camera is already there (breaks onMoveEnd → view feedback loops).
  const viewLng = view?.center?.[0];
  const viewLat = view?.center?.[1];
  const viewZoom = view?.zoom;
  const viewBearing = view?.bearing;
  const viewPitch = view?.pitch;
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed by the view fields (not object identity); animate is read via a ref
  useEffect(() => {
    if (!map || !view) return;
    if (matchesCamera(map, view)) return;
    const anim = animateRef.current;
    if (anim === false) {
      map.jumpTo(view);
    } else {
      map.easeTo({ ...view, ...(anim === true ? undefined : anim) });
    }
  }, [map, viewLng, viewLat, viewZoom, viewBearing, viewPitch]);

  // Declarative fitBounds. Keyed by value (not identity) so inline bounds
  // literals don't refit on every render; options don't retrigger a fit.
  const fitBoundsOptionsRef = useRef(fitBoundsOptions);
  fitBoundsOptionsRef.current = fitBoundsOptions;
  const fitBoundsKey = fitBounds ? JSON.stringify(fitBounds) : "";
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed by fitBoundsKey value; options are read via a ref to avoid refits on identity change
  useEffect(() => {
    if (!map || !fitBounds) return;
    map.fitBounds(fitBounds, fitBoundsOptionsRef.current);
  }, [map, fitBoundsKey]);

  // Explicit type arguments (rather than a cast on the returned value)
  // sidestep a TS inference quirk: matching the ref parameter's `T | null`
  // shape against `map`'s own `Map | null` type would otherwise infer T as
  // the non-null `Map`, which then rejects `map` (typed `Map | null`) as R.
  useImperativeHandle<MapRef, MapRef>(ref, () => map, [map]);

  const value = useMemo(
    () => ({ map, loaded, reportError }),
    [map, loaded, reportError],
  );

  // Loading indicator (opt-in via `loader`, off by default), shown until the
  // map loads. The built-in loader cross-fades out via `Fade` (disabled under
  // reduced-motion); a custom node is mounted/unmounted plainly so we never
  // require ref-forwarding from arbitrary nodes.
  let loaderElement: ReactNode = null;
  if (loader && !mapError) {
    if (typeof loader === "boolean") {
      loaderElement = (
        <Fade in={!loaded} unmountOnExit timeout={reduceMotion ? 0 : undefined}>
          <MapLoader {...loaderProps} />
        </Fade>
      );
    } else if (!loaded) {
      loaderElement = loader;
    }
  }

  return (
    <MapContext.Provider value={value}>
      <Box
        ref={containerRef}
        role="region"
        aria-label="Interactive map"
        aria-busy={loader ? !loaded : undefined}
        sx={[Styles.container, ...(Array.isArray(sx) ? sx : [sx])]}
        {...boxProps}
      >
        {mapError ? (
          (fallback ?? <MapErrorPanel error={mapError} />)
        ) : (
          <LayerRegistryProvider>
            {loaded ? children : null}
          </LayerRegistryProvider>
        )}
        {loaderElement}
      </Box>
    </MapContext.Provider>
  );
});

export default Map;
export type { MapErrorKind } from "../../context/MapContext";

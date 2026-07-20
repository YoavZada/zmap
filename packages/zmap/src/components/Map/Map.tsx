import {
  forwardRef,
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
  type LngLatBoundsLike,
  type MapLibreEvent,
  type MapMouseEvent,
  type MapOptions,
} from "maplibre-gl";
import Box, { type BoxProps } from "@mui/material/Box";
import { MapContext } from "../../context/MapContext";
import { LayerRegistryProvider } from "../../context/LayerRegistryContext";
import { useColorScheme, type ColorScheme } from "../../hooks/useColorScheme";
import { providerKey, resolveStyle, type MapStyleInput } from "../../providers";
import type { LngLatTuple } from "../../utils/geojson";
import Styles from "./map.style";

export interface MapViewState {
  center?: LngLatTuple;
  zoom?: number;
  bearing?: number;
  pitch?: number;
}

/** A map-level event handler receiving the camera state after the event. */
export type MapViewEventHandler = (
  view: Required<MapViewState>,
  event: MapLibreEvent,
) => void;

export interface MapProps
  extends Omit<
    BoxProps,
    "onLoad" | "ref" | "onClick" | "onDoubleClick" | "onContextMenu"
  > {
  /**
   * Basemap source: a built-in id ("carto" | "osm"), a custom MapProvider,
   * a raw style URL, or a full MapLibre StyleSpecification. Defaults to "carto".
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
  /** Allow user pan/zoom/rotate. Default true. */
  interactive?: boolean;
  /**
   * Let the map wrap/repeat horizontally and scroll forever. Default false —
   * the map shows a single, non-wrapping world (a barrier), instead of the
   * infinite east-west repetition MapLibre renders by default.
   */
  infinite?: boolean;
  /** Hide MapLibre's built-in attribution control (attribute elsewhere). */
  hideAttribution?: boolean;
  /** Escape hatch for any other MapLibre map option. */
  mapOptions?: Partial<MapOptions>;
  /** Called once with the map instance after the "load" event. */
  onLoad?: (map: maplibregl.Map) => void;
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

/**
 * The map container. Creates a MapLibre GL instance, exposes it via context to
 * children (markers, controls, layers…), and swaps the basemap style when the
 * MUI theme mode changes.
 */
const Map = forwardRef<maplibregl.Map | null, MapProps>(function Map(
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
    mapOptions,
    onLoad,
    onClick,
    onDblClick,
    onContextMenu,
    onMove,
    onMoveEnd,
    onZoomEnd,
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

  const mode = useColorScheme(colorScheme);

  // Keep latest handlers without re-creating the map or re-subscribing.
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;
  const handlersRef = useRef({
    onClick,
    onDblClick,
    onContextMenu,
    onMove,
    onMoveEnd,
    onZoomEnd,
  });
  handlersRef.current = {
    onClick,
    onDblClick,
    onContextMenu,
    onMove,
    onMoveEnd,
    onZoomEnd,
  };

  // Create the map exactly once.
  // biome-ignore lint/correctness/useExhaustiveDependencies: created once; later prop changes are handled by the effects below
  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: resolveStyle(provider, mode),
      center: center ?? initialView?.center ?? [0, 20],
      zoom: zoom ?? initialView?.zoom ?? 1.5,
      bearing: initialView?.bearing ?? 0,
      pitch: initialView?.pitch ?? 0,
      minZoom,
      maxZoom,
      interactive,
      renderWorldCopies: infinite,
      attributionControl: hideAttribution ? false : undefined,
      ...mapOptions,
    });

    mapRef.current = instance;
    setMap(instance);

    const handleLoad = () => {
      setLoaded(true);
      onLoadRef.current?.(instance);
    };
    instance.on("load", handleLoad);

    return () => {
      instance.off("load", handleLoad);
      instance.remove();
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

    map.on("click", onClickEv);
    map.on("dblclick", onDblClickEv);
    map.on("contextmenu", onContextMenuEv);
    map.on("move", onMoveEv);
    map.on("moveend", onMoveEndEv);
    map.on("zoomend", onZoomEndEv);
    return () => {
      map.off("click", onClickEv);
      map.off("dblclick", onDblClickEv);
      map.off("contextmenu", onContextMenuEv);
      map.off("move", onMoveEv);
      map.off("moveend", onMoveEndEv);
      map.off("zoomend", onZoomEndEv);
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

  useImperativeHandle(ref, () => map as maplibregl.Map, [map]);

  const value = useMemo(() => ({ map, loaded }), [map, loaded]);

  return (
    <MapContext.Provider value={value}>
      <Box
        ref={containerRef}
        aria-label="Interactive map"
        sx={[Styles.container, ...(Array.isArray(sx) ? sx : [sx])]}
        {...boxProps}
      >
        <LayerRegistryProvider>
          {loaded ? children : null}
        </LayerRegistryProvider>
      </Box>
    </MapContext.Provider>
  );
});

export default Map;

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import maplibregl, { type MapOptions } from "maplibre-gl";
import Box, { type BoxProps } from "@mui/material/Box";
import { MapContext } from "../context/MapContext";
import { LayerRegistryProvider } from "../context/LayerRegistryContext";
import { useColorScheme, type ColorScheme } from "../hooks/useColorScheme";
import { providerKey, resolveStyle, type MapStyleInput } from "../providers";
import type { LngLatTuple } from "../utils/geojson";
import Styles from "./map.style";

export interface MapViewState {
  center?: LngLatTuple;
  zoom?: number;
  bearing?: number;
  pitch?: number;
}

export interface MapProps extends Omit<BoxProps, "onLoad" | "ref"> {
  /**
   * Basemap source: a built-in id ("carto" | "osm"), a custom MapProvider,
   * a raw style URL, or a full MapLibre StyleSpecification. Defaults to "carto".
   */
  provider?: MapStyleInput;
  /** "auto" follows the MUI theme (default); "light"/"dark" force a basemap. */
  colorScheme?: ColorScheme;
  /** Initial camera position. */
  initialView?: MapViewState;
  /** Shorthand for `initialView.center`. */
  center?: LngLatTuple;
  /** Shorthand for `initialView.zoom`. */
  zoom?: number;
  minZoom?: number;
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
  children?: ReactNode;
}

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
    minZoom,
    maxZoom,
    interactive = true,
    infinite = false,
    hideAttribution = false,
    mapOptions,
    onLoad,
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

  // Keep latest onLoad without re-creating the map.
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  // Create the map exactly once.
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
    // Created once; later prop changes are handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap basemap style on provider / color-mode change (skipping the first run,
  // since the initial style is applied at creation). Custom layers re-add
  // themselves via useMapLayer's "styledata" listener.
  const styleKey = `${providerKey(provider)}::${mode}`;
  const firstStyleRun = useRef(true);
  useEffect(() => {
    if (firstStyleRun.current) {
      firstStyleRun.current = false;
      return;
    }
    const instance = mapRef.current;
    if (!instance) return;
    instance.setStyle(resolveStyle(provider, mode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useImperativeHandle(ref, () => map as maplibregl.Map, [map]);

  const value = useMemo(() => ({ map, loaded }), [map, loaded]);

  return (
    <MapContext.Provider value={value}>
      <Box
        ref={containerRef}
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

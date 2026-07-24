import { type FC, useCallback, useId } from "react";
import type {
  Map as MapLibreMap,
  RasterDEMSourceSpecification,
  SkySpecification,
} from "maplibre-gl";
import { useMapContext } from "../../context/useMap";
import { useStyleReapply } from "../../hooks/useStyleReapply";

/** The free AWS Terrarium elevation tileset — the default terrain DEM source. */
export const terrariumDem = {
  url: "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
  encoding: "terrarium" as const,
  tileSize: 256,
  maxzoom: 15,
};

const DEFAULT_SKY: SkySpecification = {
  "sky-color": "#199EF3",
  "sky-horizon-blend": 0.5,
  "horizon-color": "#ffffff",
  "horizon-fog-blend": 0.5,
  "fog-color": "#0000ff",
  "fog-ground-blend": 0.5,
};

/** Props for `<Terrain>`, which drapes the basemap over 3D elevation. */
export type TerrainProps = {
  /**
   * Raster-DEM tile URL template or explicit tiles array. Defaults to the free
   * AWS Terrarium elevation tileset (`terrariumDem`) — fair use; self-host for
   * production traffic.
   */
  demSource?: string | string[];
  /** DEM encoding. Default "terrarium" (matches the default source). */
  encoding?: "terrarium" | "mapbox";
  /** Vertical exaggeration of the terrain. Default 1. */
  exaggeration?: number;
  /** DEM tile size in px. Default 256. */
  tileSize?: number;
  /** Add an atmospheric sky. `true` uses a default; pass a spec to customize. */
  sky?: boolean | SkySpecification;
  /** Stable raster-dem source id. Auto-generated when omitted. */
  id?: string;
  /** Escape hatch merged into the raster-dem source spec. */
  demSourceOptions?: Partial<
    Omit<RasterDEMSourceSpecification, "type" | "tiles" | "url">
  >;
};

/**
 * Enables 3D terrain: adds a raster-DEM source and calls `setTerrain`, with an
 * optional atmospheric sky. Re-applies itself after theme-driven style swaps,
 * and disables terrain on unmount.
 */
const Terrain: FC<TerrainProps> = ({
  demSource,
  encoding = "terrarium",
  exaggeration = 1,
  tileSize = 256,
  sky,
  id,
  demSourceOptions,
}) => {
  const { map, loaded } = useMapContext();
  const reactId = useId();
  const sourceId =
    id ?? `zmap-terrain-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const tiles =
    demSource === undefined
      ? [terrariumDem.url]
      : Array.isArray(demSource)
        ? demSource
        : [demSource];
  const resolvedEncoding =
    demSource === undefined ? terrariumDem.encoding : encoding;

  // `tiles` is a fresh array each render but only its *contents* matter; the
  // deps join it to a stable string. The remaining deps are primitives / stable
  // references, so the exhaustive-deps check's array-identity worry is moot.
  // biome-ignore lint/correctness/useExhaustiveDependencies: tiles compared by content
  const apply = useCallback(
    (m: MapLibreMap) => {
      if (!m.getSource(sourceId)) {
        m.addSource(sourceId, {
          type: "raster-dem",
          tiles,
          tileSize,
          encoding: resolvedEncoding,
          ...demSourceOptions,
        } as RasterDEMSourceSpecification);
      }
      m.setTerrain({ source: sourceId, exaggeration });
      if (sky) m.setSky(sky === true ? DEFAULT_SKY : sky);
    },
    [
      sourceId,
      tiles.join("|"),
      tileSize,
      resolvedEncoding,
      exaggeration,
      sky,
      demSourceOptions,
    ],
  );

  const cleanup = useCallback(
    (m: MapLibreMap) => {
      m.setTerrain(null);
      if (m.getSource(sourceId)) m.removeSource(sourceId);
    },
    [sourceId],
  );

  useStyleReapply(map, loaded, apply, cleanup);
  return null;
};

export default Terrain;

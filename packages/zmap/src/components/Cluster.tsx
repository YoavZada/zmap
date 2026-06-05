import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { useTheme, type Theme } from "@mui/material/styles";
import type { GeoJSONSource } from "maplibre-gl";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMapContext } from "../context/useMap";
import { useMapLayer, type LayerInput } from "../hooks/useMapLayer";
import Marker from "./Marker";
import { resolvePaletteColor } from "../utils/color";
import { featureCollection, pointFeature } from "../utils/geojson";
import Styles from "./cluster.style";

export interface ClusterPoint {
  longitude: number;
  latitude: number;
  id?: string | number;
  properties?: Record<string, unknown>;
}

export interface ClusterProps {
  id?: string;
  points: ClusterPoint[];
  /** Cluster radius in pixels. Default 50. */
  radius?: number;
  /** Max zoom at which points cluster. Default 14. */
  maxZoom?: number;
  /** Cluster bubble color (palette token or CSS). Default "primary.main". */
  color?: string;
  /** Unclustered point color. Default "secondary.main". */
  pointColor?: string;
  onPointClick?: (point: ClusterPoint) => void;
  /** Custom cluster bubble. Receives the count and a zoom-to-expand callback. */
  renderCluster?: (count: number, expand: () => void) => ReactNode;
  /** Custom single-point marker. */
  renderPoint?: (point: ClusterPoint) => ReactNode;
}

type ClusterItem = {
  kind: "cluster";
  key: string;
  clusterId: number;
  lng: number;
  lat: number;
  count: number;
};
type PointItem = {
  kind: "point";
  key: string;
  idx: number;
  lng: number;
  lat: number;
};
type RenderItem = ClusterItem | PointItem;

function bubbleSize(count: number): number {
  if (count < 10) return 36;
  if (count < 100) return 44;
  if (count < 1000) return 56;
  return 68;
}

function safeContrast(theme: Theme, color: string): string {
  try {
    return theme.palette.getContrastText(color);
  } catch {
    return "#fff";
  }
}

function DefaultClusterBubble({
  count,
  color,
  contrast,
  onClick,
}: {
  count: number;
  color: string;
  contrast: string;
  onClick: () => void;
}) {
  const size = bubbleSize(count);
  return (
    <Box onClick={onClick} sx={Styles.bubble(size, color, contrast)}>
      <Typography variant="body2" fontWeight={700}>
        {count}
      </Typography>
    </Box>
  );
}

function DefaultPointDot({ color }: { color: string }) {
  return <Box sx={Styles.dot(color)} />;
}

/**
 * Clusters a set of points using MapLibre's native clustering, rendering cluster
 * bubbles and single points as themed MUI markers. Clicking a cluster zooms in
 * to expand it.
 */
const Cluster: FC<ClusterProps> = ({
  id,
  points,
  radius = 50,
  maxZoom = 14,
  color = "primary.main",
  pointColor = "secondary.main",
  onPointClick,
  renderCluster,
  renderPoint,
}) => {
  const { map, loaded } = useMapContext();
  const theme = useTheme();
  const reactId = useId();
  const baseId = id ?? `zmap-cluster-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const resolvedColor = resolvePaletteColor(theme, color);
  const resolvedPointColor = resolvePaletteColor(theme, pointColor);
  const contrast = safeContrast(theme, resolvedColor);

  const data = useMemo(
    () =>
      featureCollection(
        points.map((p, i) =>
          pointFeature([p.longitude, p.latitude], { _idx: i, ...p.properties }),
        ),
      ),
    [points],
  );

  // An invisible layer so MapLibre actually tiles the clustered source — a
  // source with no consuming layer is never loaded, so querySourceFeatures
  // (which drives the DOM bubbles below) would return nothing.
  const layers = useMemo<LayerInput[]>(
    () => [
      {
        id: `${baseId}-anchor`,
        type: "circle",
        paint: { "circle-radius": 0, "circle-opacity": 0 },
      },
    ],
    [baseId],
  );

  // Manage the clustered source; bubbles + points are themed DOM markers.
  useMapLayer({
    id: baseId,
    data,
    sourceOptions: { cluster: true, clusterRadius: radius, clusterMaxZoom: maxZoom },
    layers,
  });

  const [items, setItems] = useState<RenderItem[]>([]);

  useEffect(() => {
    if (!map || !loaded) return;

    const update = () => {
      if (!map.getSource(baseId)) return;
      let feats;
      try {
        feats = map.querySourceFeatures(baseId);
      } catch {
        return;
      }
      const clusters = new globalThis.Map<number, ClusterItem>();
      const singles = new globalThis.Map<string, PointItem>();
      for (const f of feats) {
        if (f.geometry.type !== "Point") continue;
        const [lng, lat] = f.geometry.coordinates as [number, number];
        const props = f.properties ?? {};
        if (props.cluster) {
          const cid = props.cluster_id as number;
          if (!clusters.has(cid)) {
            clusters.set(cid, {
              kind: "cluster",
              key: `c${cid}`,
              clusterId: cid,
              lng,
              lat,
              count: props.point_count as number,
            });
          }
        } else {
          const idx = props._idx as number;
          const key = `p${idx}`;
          if (!singles.has(key)) {
            singles.set(key, { kind: "point", key, idx, lng, lat });
          }
        }
      }
      setItems([...clusters.values(), ...singles.values()]);
    };

    update();
    const onData = (e: { sourceId?: string; isSourceLoaded?: boolean }) => {
      if (e.sourceId === baseId && e.isSourceLoaded) update();
    };
    map.on("moveend", update);
    map.on("idle", update);
    map.on("data", onData);
    return () => {
      map.off("moveend", update);
      map.off("idle", update);
      map.off("data", onData);
    };
  }, [map, loaded, baseId]);

  const expand = useCallback(
    (clusterId: number, center: [number, number]) => {
      if (!map) return;
      const src = map.getSource(baseId) as GeoJSONSource | undefined;
      if (!src) return;
      src
        .getClusterExpansionZoom(clusterId)
        .then((zoom) => map.easeTo({ center, zoom }))
        .catch(() => {});
    },
    [map, baseId],
  );

  return (
    <>
      {items.map((item) =>
        item.kind === "cluster" ? (
          <Marker
            key={item.key}
            longitude={item.lng}
            latitude={item.lat}
            anchor="center"
          >
            {renderCluster ? (
              renderCluster(item.count, () =>
                expand(item.clusterId, [item.lng, item.lat]),
              )
            ) : (
              <DefaultClusterBubble
                count={item.count}
                color={resolvedColor}
                contrast={contrast}
                onClick={() => expand(item.clusterId, [item.lng, item.lat])}
              />
            )}
          </Marker>
        ) : (
          <Marker
            key={item.key}
            longitude={item.lng}
            latitude={item.lat}
            anchor="center"
            onClick={() => onPointClick?.(points[item.idx])}
          >
            {renderPoint ? (
              renderPoint(points[item.idx])
            ) : (
              <DefaultPointDot color={resolvedPointColor} />
            )}
          </Marker>
        ),
      )}
    </>
  );
};

export default Cluster;

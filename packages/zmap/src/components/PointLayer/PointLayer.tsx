import { useEffect, useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import { useMapContext } from "../../context/useMap";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { resolvePaletteColor } from "../../utils/color";
import { featureCollection, pointFeature } from "../../utils/geojson";

export type LayerPoint = {
  longitude: number;
  latitude: number;
  properties?: Record<string, unknown>;
};

export type PointLayerProps = {
  id?: string;
  points: LayerPoint[];
  /** Palette token or CSS color. Default "primary.main". */
  color?: string;
  radius?: number;
  opacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  onClick?: (point: LayerPoint, index: number) => void;
};

/**
 * Renders many points as a single GPU circle layer — cheaper than one DOM
 * Marker per point. For rich/interactive content, use Marker instead.
 */
const PointLayer: FC<PointLayerProps> = ({
  id,
  points,
  color = "primary.main",
  radius = 6,
  opacity = 1,
  strokeColor = "background.paper",
  strokeWidth = 1.5,
  onClick,
}) => {
  const theme = useTheme();
  const { map } = useMapContext();
  const reactId = useId();
  const baseId = id ?? `zmap-points-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const layerId = `${baseId}-circle`;

  const data = useMemo(
    () =>
      featureCollection(
        points.map((p, i) =>
          pointFeature([p.longitude, p.latitude], { _idx: i, ...p.properties }),
        ),
      ),
    [points],
  );

  const layers = useMemo<LayerInput[]>(
    () => [
      {
        id: layerId,
        type: "circle",
        paint: {
          "circle-radius": radius,
          "circle-color": resolvePaletteColor(theme, color),
          "circle-opacity": opacity,
          "circle-stroke-color": resolvePaletteColor(theme, strokeColor),
          "circle-stroke-width": strokeWidth,
        },
      },
    ],
    [layerId, radius, color, opacity, strokeColor, strokeWidth, theme],
  );

  useMapLayer({ id: baseId, data, layers });

  useEffect(() => {
    if (!map || !onClick) return;
    const handleClick = (e: any) => {
      const f = e.features?.[0];
      const idx = f?.properties?._idx as number | undefined;
      if (idx != null && points[idx]) onClick(points[idx], idx);
    };
    const enter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const leave = () => {
      map.getCanvas().style.cursor = "";
    };
    map.on("click", layerId, handleClick);
    map.on("mouseenter", layerId, enter);
    map.on("mouseleave", layerId, leave);
    return () => {
      map.off("click", layerId, handleClick);
      map.off("mouseenter", layerId, enter);
      map.off("mouseleave", layerId, leave);
    };
  }, [map, layerId, onClick, points]);

  return null;
};

export default PointLayer;

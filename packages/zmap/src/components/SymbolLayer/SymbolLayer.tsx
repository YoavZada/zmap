import { useEffect, useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import { useMapContext } from "../../context/useMap";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { resolvePaletteColor } from "../../utils/color";
import { featureCollection, pointFeature } from "../../utils/geojson";

export type SymbolPoint = {
  longitude: number;
  latitude: number;
  /** The text rendered at this point. */
  label?: string;
  properties?: Record<string, unknown>;
};

export type SymbolLayerProps = {
  /** Unique source/layer id. Auto-generated when omitted. */
  id?: string;
  /** The labeled points to render. */
  points: SymbolPoint[];
  /** Text color — palette token or CSS. Default "text.primary". */
  color?: string;
  /** Halo behind the text for basemap contrast. Default "background.paper". */
  haloColor?: string;
  /** Halo width in px. Default 1.2. */
  haloWidth?: number;
  /** Text size in px. Default 12. */
  size?: number;
  /**
   * Font stack, e.g. `["Open Sans Bold"]`. Must exist in the basemap's glyph
   * set; when omitted, the style's default fonts are used.
   */
  font?: string[];
  /** Which side of the coordinate the text sits on. Default "top". */
  anchor?:
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  /** Text offset in ems, [x, y]. Default [0, 0.4] (just under the point). */
  offset?: [number, number];
  /**
   * Optional icon drawn at the coordinate beneath the label: an image URL
   * (PNG/JPEG/WebP) loaded and registered with the map. `size` scales it
   * (1 = native pixels).
   */
  icon?: { src: string; size?: number };
  /** Draw labels even when they collide. Default false (MapLibre declutters). */
  allowOverlap?: boolean;
  /** Fired with the clicked point and its index in `points`. */
  onClick?: (point: SymbolPoint, index: number) => void;
};

/**
 * Text labels (optionally with an icon) rendered as a single GPU symbol layer
 * — MapLibre declutters overlapping labels automatically as you zoom. For
 * rich interactive content, use Marker instead.
 */
const SymbolLayer: FC<SymbolLayerProps> = ({
  id,
  points,
  color = "text.primary",
  haloColor = "background.paper",
  haloWidth = 1.2,
  size = 12,
  font,
  anchor = "top",
  offset = [0, 0.4],
  icon,
  allowOverlap = false,
  onClick,
}) => {
  const theme = useTheme();
  const { map } = useMapContext();
  const reactId = useId();
  const baseId = id ?? `zmap-symbols-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const layerId = `${baseId}-symbol`;
  const imageId = `${baseId}-icon`;

  const data = useMemo(
    () =>
      featureCollection(
        points.map((p, i) =>
          pointFeature([p.longitude, p.latitude], {
            _idx: i,
            label: p.label ?? "",
            ...p.properties,
          }),
        ),
      ),
    [points],
  );

  // Register the icon image, and re-register after style swaps wipe it.
  const iconSrc = icon?.src;
  useEffect(() => {
    if (!map || !iconSrc) return;
    let cancelled = false;

    const add = async () => {
      try {
        const res = await map.loadImage(iconSrc);
        if (cancelled || !map.getCanvas()) return;
        if (!map.hasImage(imageId)) map.addImage(imageId, res.data);
      } catch {
        /* unreachable image — layer renders text only */
      }
    };
    add();

    const onStyleData = () => {
      if (!map.hasImage(imageId)) void add();
    };
    map.on("styledata", onStyleData);
    return () => {
      cancelled = true;
      map.off("styledata", onStyleData);
      try {
        if (map.hasImage(imageId)) map.removeImage(imageId);
      } catch {
        /* style already torn down */
      }
    };
  }, [map, iconSrc, imageId]);

  const layers = useMemo<LayerInput[]>(
    () => [
      {
        id: layerId,
        type: "symbol",
        layout: {
          "text-field": ["get", "label"],
          "text-size": size,
          "text-anchor": anchor,
          "text-offset": offset,
          ...(font ? { "text-font": font } : undefined),
          ...(allowOverlap
            ? { "text-allow-overlap": true, "icon-allow-overlap": true }
            : undefined),
          ...(icon
            ? { "icon-image": imageId, "icon-size": icon.size ?? 1 }
            : undefined),
        },
        paint: {
          "text-color": resolvePaletteColor(theme, color),
          "text-halo-color": resolvePaletteColor(theme, haloColor),
          "text-halo-width": haloWidth,
        },
      } as LayerInput,
    ],
    [
      layerId,
      imageId,
      size,
      anchor,
      offset,
      font,
      allowOverlap,
      icon,
      color,
      haloColor,
      haloWidth,
      theme,
    ],
  );

  useMapLayer({ id: baseId, data, layers });

  useEffect(() => {
    if (!map || !onClick) return;
    const handleClick = (e: {
      features?: { properties?: Record<string, unknown> }[];
    }) => {
      const idx = e.features?.[0]?.properties?._idx as number | undefined;
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

export default SymbolLayer;

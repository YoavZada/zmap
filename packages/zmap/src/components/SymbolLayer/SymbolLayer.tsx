import { useEffect, useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import type { MapLayerMouseEvent } from "maplibre-gl";
import { useMapContext } from "../../context/useMap";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { useLayerClick } from "../../hooks/useLayerClick";
import { useLayerHover } from "../../hooks/useLayerHover";
import { resolvePaletteColor } from "../../utils/color";
import { featureCollection, pointFeature } from "../../utils/geojson";
import type { BasePoint } from "../../utils/geojson";
import {
  applyLayerOverrides,
  type LayerOverride,
} from "../../utils/layerOverrides";
import {
  hoverCase,
  resolveHoverHighlight,
  type HoverHighlight,
} from "../../utils/hoverPaint";

/** A labeled point rendered by `<SymbolLayer>`. */
export type SymbolPoint = BasePoint & {
  /** The text rendered at this point. */
  label?: string;
};

/** Props for `<SymbolLayer>`, text labels (optionally with an icon) rendered as a single GPU symbol layer. */
export type SymbolLayerProps = {
  /**
   * Unique source/layer id. Auto-generated when omitted. Sub-layers are
   * `${id}-<role>`; see `layerIds()`. Auto-generated ids are not
   * predictable — pass `id` when you need to reference the layers.
   */
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
  /** Insert the layer before this existing layer id. */
  beforeId?: string;
  /**
   * Feature property to use as the stable feature id (MapLibre `promoteId`).
   * When omitted, ids are generated per feature (`generateId`), which is
   * enough for hover / feature-state highlighting.
   */
  featureId?: string;
  /** Paint/layout patches merged into the generated symbol layer. */
  layerOverrides?: { symbol?: LayerOverride };
  /** Fired with the clicked point, its index in `points`, and the raw event. */
  onClick?: (
    point: SymbolPoint,
    index: number,
    event: MapLayerMouseEvent,
  ) => void;
  /** Fired with the hovered point, its index in `points` (-1 on leave), and the raw event. */
  onHover?: (
    point: SymbolPoint | null,
    index: number,
    event: MapLayerMouseEvent,
  ) => void;
  /** Highlight the hovered feature: `true` for theme defaults (stronger fill, `text.primary` outline), or explicit colors/opacity. Uses feature-state, so it works with the default generated ids. */
  hoverHighlight?: boolean | HoverHighlight;
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
  beforeId,
  featureId,
  layerOverrides,
  onClick,
  onHover,
  hoverHighlight,
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

  const resolvedTextColor = resolvePaletteColor(theme, color);
  const resolvedHaloColor = resolvePaletteColor(theme, haloColor);

  const highlight = useMemo(
    () =>
      resolveHoverHighlight(theme, hoverHighlight, {
        fillColor: resolvedTextColor,
        strokeColor: resolvedHaloColor,
      }),
    [hoverHighlight, theme, resolvedTextColor, resolvedHaloColor],
  );

  const layers = useMemo<LayerInput[]>(
    () =>
      applyLayerOverrides(
        [
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
              "text-color": highlight
                ? hoverCase(highlight.fillColor, resolvedTextColor)
                : resolvedTextColor,
              "text-halo-color": highlight
                ? hoverCase(highlight.strokeColor, resolvedHaloColor)
                : resolvedHaloColor,
              "text-halo-width": haloWidth,
            },
          } as LayerInput,
        ],
        layerOverrides,
      ),
    [
      layerId,
      imageId,
      size,
      anchor,
      offset,
      font,
      allowOverlap,
      icon,
      resolvedTextColor,
      resolvedHaloColor,
      haloWidth,
      highlight,
      layerOverrides,
    ],
  );

  const sourceOptions = useMemo(
    () => (featureId ? { promoteId: featureId } : { generateId: true }),
    [featureId],
  );

  useMapLayer({ id: baseId, data, layers, beforeId, sourceOptions });

  useLayerClick(
    layerId,
    onClick
      ? (e) => {
          const idx = e.features?.[0]?.properties?._idx as number | undefined;
          if (idx != null && points[idx]) onClick(points[idx], idx, e);
        }
      : undefined,
  );

  useLayerHover({
    layerIds: [layerId],
    sourceId: baseId,
    featureState: Boolean(hoverHighlight),
    onHover: onHover
      ? (feature, event) => {
          const idx = feature?.properties?._idx as number | undefined;
          if (feature && idx != null && points[idx]) {
            onHover(points[idx], idx, event);
          } else {
            onHover(null, -1, event);
          }
        }
      : undefined,
  });

  return null;
};

export default SymbolLayer;

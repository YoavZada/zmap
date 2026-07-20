import { useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import type { ExpressionSpecification } from "maplibre-gl";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { resolvePaletteColor } from "../../utils/color";
import { featureCollection, pointFeature } from "../../utils/geojson";
import {
  applyLayerOverrides,
  type LayerOverride,
} from "../../utils/layerOverrides";
import type { LayerPoint } from "../PointLayer";

export type HeatmapLayerProps = {
  /** Unique source/layer id. Auto-generated when omitted. */
  id?: string;
  /** The points that feed the density surface. */
  points: LayerPoint[];
  /** Feature property to weight points by (defaults to equal weight). */
  weightProperty?: string;
  /** Influence radius of each point in pixels. Default 20. */
  radius?: number;
  /** Global density multiplier — higher reads hotter. Default 1. */
  intensity?: number;
  /** Heatmap opacity, 0–1. Default 0.85. */
  opacity?: number;
  /**
   * Override the density→color ramp: either `[density, color]` stops over the
   * 0–1 density range (colors may be palette tokens, like HexbinLayer's
   * `colorRamp`), or a raw MapLibre expression.
   */
  colorRamp?: [number, string][] | ExpressionSpecification;
  /** Insert the layer before this existing layer id. */
  beforeId?: string;
  /** Paint/layout patches merged into the generated heatmap layer. */
  layerOverrides?: { heat?: LayerOverride };
};

/** True for the `[density, color][]` stops form of `colorRamp`. */
function isStopsRamp(
  ramp: [number, string][] | ExpressionSpecification,
): ramp is [number, string][] {
  return Array.isArray(ramp[0]);
}

/** Renders points as a density heatmap (MapLibre `heatmap` layer). */
const HeatmapLayer: FC<HeatmapLayerProps> = ({
  id,
  points,
  weightProperty,
  radius = 20,
  intensity = 1,
  opacity = 0.85,
  colorRamp,
  beforeId,
  layerOverrides,
}) => {
  const theme = useTheme();
  const reactId = useId();
  const baseId = id ?? `zmap-heat-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const data = useMemo(
    () =>
      featureCollection(
        points.map((p) =>
          pointFeature([p.longitude, p.latitude], p.properties),
        ),
      ),
    [points],
  );

  // Default ramp goes transparent → cool → warm using palette colors.
  const ramp = useMemo<ExpressionSpecification>(() => {
    if (colorRamp && isStopsRamp(colorRamp)) {
      // Stops are keyed on heatmap-density (0–1), not a feature property.
      const expr: unknown[] = ["interpolate", ["linear"], ["heatmap-density"]];
      for (const [density, c] of colorRamp) {
        expr.push(density, resolvePaletteColor(theme, c));
      }
      return expr as ExpressionSpecification;
    }
    return (
      colorRamp ??
      ([
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(0,0,0,0)",
        0.2,
        resolvePaletteColor(theme, "info.main"),
        0.4,
        resolvePaletteColor(theme, "success.main"),
        0.6,
        resolvePaletteColor(theme, "warning.main"),
        0.8,
        resolvePaletteColor(theme, "error.light"),
        1,
        resolvePaletteColor(theme, "error.main"),
      ] as ExpressionSpecification)
    );
  }, [colorRamp, theme]);

  const layers = useMemo<LayerInput[]>(
    () =>
      applyLayerOverrides(
        [
          {
            id: `${baseId}-heat`,
            type: "heatmap",
            paint: {
              "heatmap-weight": weightProperty
                ? (["get", weightProperty] as ExpressionSpecification)
                : 1,
              "heatmap-intensity": intensity,
              "heatmap-radius": radius,
              "heatmap-color": ramp,
              "heatmap-opacity": opacity,
            },
          },
        ],
        layerOverrides,
      ),
    [baseId, weightProperty, intensity, radius, ramp, opacity, layerOverrides],
  );

  useMapLayer({ id: baseId, data, layers, beforeId });
  return null;
};

export default HeatmapLayer;

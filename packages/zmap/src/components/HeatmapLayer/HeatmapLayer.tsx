import { useId, useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import type { ExpressionSpecification } from "maplibre-gl";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { resolvePaletteColor } from "../../utils/color";
import { featureCollection, pointFeature } from "../../utils/geojson";
import type { LayerPoint } from "../PointLayer";

export type HeatmapLayerProps = {
  id?: string;
  points: LayerPoint[];
  /** Feature property to weight points by (defaults to equal weight). */
  weightProperty?: string;
  radius?: number;
  intensity?: number;
  opacity?: number;
  /** Override the density→color ramp (a MapLibre expression). */
  colorRamp?: ExpressionSpecification;
};

/** Renders points as a density heatmap (MapLibre `heatmap` layer). */
const HeatmapLayer: FC<HeatmapLayerProps> = ({
  id,
  points,
  weightProperty,
  radius = 20,
  intensity = 1,
  opacity = 0.85,
  colorRamp,
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
  const ramp = useMemo<ExpressionSpecification>(
    () =>
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
      ] as ExpressionSpecification),
    [colorRamp, theme],
  );

  const layers = useMemo<LayerInput[]>(
    () => [
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
    [baseId, weightProperty, intensity, radius, ramp, opacity],
  );

  useMapLayer({ id: baseId, data, layers });
  return null;
};

export default HeatmapLayer;

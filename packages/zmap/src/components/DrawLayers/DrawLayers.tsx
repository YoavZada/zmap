import { useMemo, type FC } from "react";
import { useTheme } from "@mui/material/styles";
import type { Feature } from "geojson";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { resolvePaletteColor } from "../../utils/color";
import {
  featureCollection,
  pointFeature,
  type LngLatTuple,
} from "../../utils/geojson";
import type { DrawFeature, DrawMode } from "../../hooks/useDraw";
import ShapeLayer from "../ShapeLayer";
import PointLayer, { type LayerPoint } from "../PointLayer";

export interface DrawLayersProps {
  features: DrawFeature[];
  draft: LngLatTuple[];
  cursor: LngLatTuple | null;
  mode: DrawMode | null;
  /** Base id so each control's sources stay distinct. */
  idPrefix: string;
  color?: string;
  fillOpacity?: number;
  lineWidth?: number;
}

/**
 * Renders the output of a draw engine: completed line/polygon features through
 * a <ShapeLayer>, completed points through a <PointLayer>, and the in-progress
 * draft (dashed rubber-band path + vertices) through a dedicated preview layer.
 * Shared internals of <DrawControl> and <MeasureControl> — not exported.
 */
const DrawLayers: FC<DrawLayersProps> = ({
  features,
  draft,
  cursor,
  mode,
  idPrefix,
  color = "primary.main",
  fillOpacity = 0.3,
  lineWidth = 2,
}) => {
  const theme = useTheme();
  const resolved = resolvePaletteColor(theme, color);
  const stroke = resolvePaletteColor(theme, "background.paper");

  // Completed features handed to the same layers a consumer would use directly.
  const shapeData = useMemo(
    () =>
      featureCollection(
        features.filter((f) => f.geometry.type !== "Point") as Feature[],
      ),
    [features],
  );

  const pointData = useMemo<LayerPoint[]>(
    () =>
      features
        .filter((f) => f.geometry.type === "Point")
        .map((f) => {
          const [longitude, latitude] = (
            f.geometry as { coordinates: number[] }
          ).coordinates;
          return {
            longitude,
            latitude,
            properties: { ...f.properties } as Record<string, unknown>,
          };
        }),
    [features],
  );

  // Live draft: a faint fill (polygon), a dashed path, and the vertex dots.
  const draftData = useMemo(() => {
    const out: Feature[] = [];
    const path = cursor ? [...draft, cursor] : draft;
    if (mode === "polygon" && draft.length >= 2) {
      out.push({
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [[...path, path[0]]] },
      });
    } else if (path.length >= 2) {
      out.push({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: path },
      });
    }
    for (const v of draft) out.push(pointFeature(v));
    return featureCollection(out);
  }, [draft, cursor, mode]);

  const draftLayers = useMemo<LayerInput[]>(
    () => [
      {
        id: `${idPrefix}-draft-fill`,
        type: "fill",
        paint: { "fill-color": resolved, "fill-opacity": fillOpacity * 0.6 },
      },
      {
        id: `${idPrefix}-draft-line`,
        type: "line",
        paint: {
          "line-color": resolved,
          "line-width": lineWidth,
          "line-dasharray": [2, 1.5],
        },
      },
      {
        id: `${idPrefix}-draft-vertex`,
        type: "circle",
        paint: {
          "circle-radius": 4,
          "circle-color": resolved,
          "circle-stroke-color": stroke,
          "circle-stroke-width": 1.5,
        },
      },
    ],
    [idPrefix, resolved, stroke, fillOpacity, lineWidth],
  );

  useMapLayer({
    id: `${idPrefix}-draft`,
    data: draftData,
    layers: draftLayers,
  });

  return (
    <>
      <ShapeLayer
        id={`${idPrefix}-shapes`}
        data={shapeData}
        fillColor={color}
        lineColor={color}
        fillOpacity={fillOpacity}
        lineWidth={lineWidth}
      />
      <PointLayer
        id={`${idPrefix}-points`}
        points={pointData}
        color={color}
        radius={5}
      />
    </>
  );
};

export default DrawLayers;

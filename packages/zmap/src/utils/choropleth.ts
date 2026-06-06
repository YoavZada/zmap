import type { ExpressionSpecification } from "maplibre-gl";
import type { Theme } from "@mui/material/styles";
import { resolvePaletteColor } from "./color";

/**
 * Drives a layer's fill color from a feature property — a choropleth. `stops`
 * are `[value, color]` pairs in ascending order; colors may be palette tokens.
 */
export interface ChoroplethSpec {
  property: string;
  stops: [number, string][];
  /** "interpolate" (smooth, default) or "step" (banded). */
  type?: "step" | "interpolate";
}

/** Builds a MapLibre paint expression from a choropleth spec. */
export function buildColorExpression(
  spec: ChoroplethSpec,
  theme: Theme,
): ExpressionSpecification {
  const stops = spec.stops.map(
    ([value, color]) => [value, resolvePaletteColor(theme, color)] as const,
  );
  const get: ExpressionSpecification = ["get", spec.property];

  if (spec.type === "step") {
    const expr: unknown[] = ["step", get, stops[0][1]];
    for (let i = 1; i < stops.length; i++) {
      expr.push(stops[i][0], stops[i][1]);
    }
    return expr as ExpressionSpecification;
  }

  const expr: unknown[] = ["interpolate", ["linear"], get];
  for (const [value, color] of stops) expr.push(value, color);
  return expr as ExpressionSpecification;
}

/** True if a `fillColor` value is a choropleth spec rather than a plain color. */
export function isChoroplethSpec(value: unknown): value is ChoroplethSpec {
  return (
    typeof value === "object" &&
    value !== null &&
    "property" in value &&
    "stops" in value
  );
}

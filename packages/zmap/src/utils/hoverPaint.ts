import type { ExpressionSpecification } from "maplibre-gl";
import type { Theme } from "@mui/material/styles";
import { resolvePaletteColor } from "./color";

/**
 * Wraps a paint value in a feature-state "hover" case:
 * `["case", ["boolean", ["feature-state", key], false], hovered, base]`.
 */
export function hoverCase(
  hovered: unknown,
  base: unknown,
  key = "hover",
): ExpressionSpecification {
  return [
    "case",
    ["boolean", ["feature-state", key], false],
    hovered,
    base,
  ] as unknown as ExpressionSpecification;
}

/** Explicit hover-highlight colors/opacity — see `resolveHoverHighlight`. */
export interface HoverHighlight {
  /** Fill (or text) color while hovered. Default: unchanged from the base fill. */
  fillColor?: string;
  /** Outline (or halo) color while hovered. Default: `"text.primary"`. */
  strokeColor?: string;
  /** Fill opacity while hovered, 0–1. Default: `min(1, base + 0.25)`. */
  fillOpacity?: number;
}

/**
 * Normalizes a `hoverHighlight` prop value into concrete colors/opacity, or
 * `null` when hover highlighting is off. `true` applies the theme defaults
 * (base fill color unchanged, a stronger opacity, and a `text.primary`
 * outline); an object overrides individual fields. Palette tokens resolve
 * through `resolvePaletteColor`.
 *
 * `defaults.fillColor` must be omitted when the base fill is an expression
 * (a choropleth/ramp) rather than a flat color — there's no meaningful
 * "unchanged" literal for an expression. In that case the returned
 * `fillColor` is `undefined` unless the caller's `value` gives an explicit
 * `fillColor` override; callers must leave the color unwrapped (using the
 * expression as-is) whenever `fillColor` comes back `undefined`.
 */
export function resolveHoverHighlight(
  theme: Theme,
  value: boolean | HoverHighlight | undefined,
  defaults: { fillColor?: string; strokeColor?: string; fillOpacity?: number },
): { fillColor?: string; strokeColor?: string; fillOpacity?: number } | null {
  if (!value) return null;
  const opts: HoverHighlight = value === true ? {} : value;

  const baseFillOpacity = defaults.fillOpacity ?? 1;
  const fillColor =
    opts.fillColor !== undefined
      ? resolvePaletteColor(theme, opts.fillColor)
      : defaults.fillColor;
  const fillOpacity = opts.fillOpacity ?? Math.min(1, baseFillOpacity + 0.25);
  const strokeColor = resolvePaletteColor(
    theme,
    opts.strokeColor ?? defaults.strokeColor ?? "text.primary",
  );

  return { fillColor, strokeColor, fillOpacity };
}

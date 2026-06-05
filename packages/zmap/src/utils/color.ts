import type { Theme } from "@mui/material/styles";

/**
 * Resolves an MUI palette token ("primary.main", "error.light", …) against the
 * theme. Anything that isn't a known token (e.g. "#ff0000", "rgb(...)") is
 * returned unchanged, so callers can pass raw CSS colors too.
 */
export function resolvePaletteColor(theme: Theme, color: string): string {
  if (!color.includes(".")) return color;

  const [group, shade] = color.split(".");
  const palette = theme.palette as unknown as Record<string, unknown>;
  const entry = palette[group];
  if (entry && typeof entry === "object" && shade in (entry as object)) {
    const value = (entry as Record<string, unknown>)[shade];
    if (typeof value === "string") return value;
  }
  return color;
}

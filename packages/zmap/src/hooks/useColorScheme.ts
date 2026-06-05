import { useTheme } from "@mui/material/styles";
import type { ColorMode } from "../providers/types";

/** "auto" follows the MUI theme; "light"/"dark" force a basemap. */
export type ColorScheme = "auto" | "light" | "dark";

/** Resolves the effective basemap color mode, following the MUI theme on "auto". */
export function useColorScheme(scheme: ColorScheme = "auto"): ColorMode {
  const theme = useTheme();
  if (scheme === "auto") {
    return theme.palette.mode === "dark" ? "dark" : "light";
  }
  return scheme;
}

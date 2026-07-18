import { describe, expect, it } from "vitest";
import { createTheme } from "@mui/material/styles";
import { resolvePaletteColor } from "./color";

const theme = createTheme();

describe("resolvePaletteColor", () => {
  it("resolves dot tokens against the palette", () => {
    expect(resolvePaletteColor(theme, "primary.main")).toBe(
      theme.palette.primary.main,
    );
    expect(resolvePaletteColor(theme, "grey.500")).toBe(
      theme.palette.grey[500],
    );
  });

  it("resolves top-level string entries like divider", () => {
    expect(resolvePaletteColor(theme, "divider")).toBe(theme.palette.divider);
  });

  it("returns raw CSS colors unchanged", () => {
    expect(resolvePaletteColor(theme, "#ff0000")).toBe("#ff0000");
    expect(resolvePaletteColor(theme, "rgb(1,2,3)")).toBe("rgb(1,2,3)");
    expect(resolvePaletteColor(theme, "tomato")).toBe("tomato");
  });

  it("returns unknown tokens unchanged", () => {
    expect(resolvePaletteColor(theme, "nope.main")).toBe("nope.main");
    expect(resolvePaletteColor(theme, "primary.nope")).toBe("primary.nope");
  });
});

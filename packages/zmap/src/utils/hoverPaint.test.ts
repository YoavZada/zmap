import { describe, expect, it } from "vitest";
import { createTheme } from "@mui/material/styles";
import { hoverCase, resolveHoverHighlight } from "./hoverPaint";

const theme = createTheme({ palette: { mode: "light" } });

describe("hoverCase", () => {
  it("builds the case expression", () => {
    expect(hoverCase("#ff0000", "#000000")).toEqual([
      "case",
      ["boolean", ["feature-state", "hover"], false],
      "#ff0000",
      "#000000",
    ]);
  });

  it("supports a custom state key", () => {
    expect(hoverCase(1, 0, "active")).toEqual([
      "case",
      ["boolean", ["feature-state", "active"], false],
      1,
      0,
    ]);
  });
});

describe("resolveHoverHighlight", () => {
  it("returns null when off", () => {
    expect(
      resolveHoverHighlight(theme, undefined, { fillColor: "#000000" }),
    ).toBeNull();
    expect(
      resolveHoverHighlight(theme, false, { fillColor: "#000000" }),
    ).toBeNull();
  });

  it("applies theme defaults and resolves palette tokens when true", () => {
    const result = resolveHoverHighlight(theme, true, {
      fillColor: "#123456",
      fillOpacity: 0.5,
    });
    expect(result).toEqual({
      fillColor: "#123456", // unchanged from the base fill
      fillOpacity: 0.75, // min(1, base + 0.25)
      strokeColor: theme.palette.text.primary,
    });
  });

  it("caps fillOpacity at 1", () => {
    const result = resolveHoverHighlight(theme, true, {
      fillColor: "#123456",
      fillOpacity: 0.9,
    });
    expect(result?.fillOpacity).toBe(1);
  });

  it("overrides individual fields from an explicit object and resolves tokens", () => {
    const result = resolveHoverHighlight(
      theme,
      { fillColor: "primary.main", fillOpacity: 0.9 },
      { fillColor: "#123456", fillOpacity: 0.5 },
    );
    expect(result).toEqual({
      fillColor: theme.palette.primary.main,
      fillOpacity: 0.9,
      strokeColor: theme.palette.text.primary,
    });
  });
});

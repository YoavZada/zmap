import { describe, expect, it } from "vitest";
import { createTheme } from "@mui/material/styles";
import { buildColorExpression, isChoroplethSpec } from "./choropleth";

const theme = createTheme({ palette: { mode: "light" } });

describe("buildColorExpression", () => {
  it("builds an interpolate expression by default", () => {
    const expr = buildColorExpression(
      {
        property: "v",
        stops: [
          [0, "#000000"],
          [10, "#ffffff"],
        ],
      },
      theme,
    ) as unknown[];
    expect(expr[0]).toBe("interpolate");
    expect(expr[1]).toEqual(["linear"]);
    expect(expr[2]).toEqual(["get", "v"]);
    expect(expr.slice(3)).toEqual([0, "#000000", 10, "#ffffff"]);
  });

  it("builds a step expression with a base output", () => {
    const expr = buildColorExpression(
      {
        property: "v",
        type: "step",
        stops: [
          [0, "#000000"],
          [5, "#ff0000"],
        ],
      },
      theme,
    ) as unknown[];
    expect(expr[0]).toBe("step");
    expect(expr[1]).toEqual(["get", "v"]);
    expect(expr[2]).toBe("#000000");
    expect(expr.slice(3)).toEqual([5, "#ff0000"]);
  });

  it("resolves palette tokens in stop colors", () => {
    const expr = buildColorExpression(
      {
        property: "v",
        stops: [
          [0, "primary.main"],
          [1, "#fff"],
        ],
      },
      theme,
    ) as unknown[];
    expect(expr[4]).toBe(theme.palette.primary.main);
    expect(expr[4]).not.toBe("primary.main");
  });
});

describe("isChoroplethSpec", () => {
  it("detects a spec object", () => {
    expect(isChoroplethSpec({ property: "v", stops: [] })).toBe(true);
  });
  it("rejects plain colors / nullish", () => {
    expect(isChoroplethSpec("primary.main")).toBe(false);
    expect(isChoroplethSpec(undefined)).toBe(false);
    expect(isChoroplethSpec(null)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { layerIds } from "./layerIds";

describe("layerIds", () => {
  it("builds ShapeLayer sub-layer ids in render order", () => {
    expect(layerIds("ShapeLayer", "x")).toEqual(["x-fill", "x-line"]);
  });

  it("builds PointLayer sub-layer ids", () => {
    expect(layerIds("PointLayer", "x")).toEqual(["x-circle"]);
  });
});

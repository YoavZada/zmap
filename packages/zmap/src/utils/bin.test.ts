import { describe, expect, it } from "vitest";
import { binPoints, type BinPoint } from "./bin";

const at = (longitude: number, latitude: number, props?: Record<string, unknown>): BinPoint => ({
  longitude,
  latitude,
  properties: props,
});

describe("binPoints", () => {
  it("returns no features for no points", () => {
    expect(binPoints([]).features).toEqual([]);
  });

  it("groups nearby points into one square cell and counts them", () => {
    // A tight (~100m) cluster sitting well inside a single ~80km cell.
    const pts = [at(10, 50), at(10.001, 50.001), at(9.999, 50)];
    const fc = binPoints(pts, { cell: "square", radius: 50 });
    expect(fc.features).toHaveLength(1);
    expect(fc.features[0].properties).toEqual({ value: 3, count: 3 });
  });

  it("separates points farther apart than the cell size", () => {
    // ~111km apart at the equator, with a 20km cell → distinct bins.
    const fc = binPoints([at(0, 0), at(1, 0)], { cell: "square", radius: 20 });
    expect(fc.features.length).toBeGreaterThan(1);
  });

  it("sums a weight property instead of counting", () => {
    const pts = [at(0, 0, { mag: 2 }), at(0.01, 0, { mag: 5 })];
    const fc = binPoints(pts, { cell: "square", radius: 50, weightProperty: "mag" });
    expect(fc.features).toHaveLength(1);
    expect(fc.features[0].properties.value).toBe(7);
    expect(fc.features[0].properties.count).toBe(2);
  });

  it("emits closed polygon rings (hex = 7 coords, square = 5)", () => {
    const hex = binPoints([at(0, 0)], { cell: "hex" });
    const ringH = hex.features[0].geometry.coordinates[0];
    expect(ringH).toHaveLength(7);
    expect(ringH[0]).toEqual(ringH[ringH.length - 1]);

    const sq = binPoints([at(0, 0)], { cell: "square" });
    const ringS = sq.features[0].geometry.coordinates[0];
    expect(ringS).toHaveLength(5);
    expect(ringS[0]).toEqual(ringS[ringS.length - 1]);
  });

  it("defaults to hex cells", () => {
    const fc = binPoints([at(10, 50)]);
    expect(fc.features[0].geometry.coordinates[0]).toHaveLength(7);
  });
});

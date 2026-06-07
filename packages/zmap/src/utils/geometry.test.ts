import { describe, expect, it } from "vitest";
import { pointInBox, pointInPolygon, type ScreenPoint } from "./geometry";

const square: ScreenPoint[] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

describe("pointInPolygon", () => {
  it("returns false for degenerate rings", () => {
    expect(pointInPolygon({ x: 1, y: 1 }, [])).toBe(false);
    expect(
      pointInPolygon({ x: 1, y: 1 }, [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]),
    ).toBe(false);
  });

  it("detects a point inside the ring", () => {
    expect(pointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
  });

  it("rejects a point outside the ring", () => {
    expect(pointInPolygon({ x: 20, y: 5 }, square)).toBe(false);
    expect(pointInPolygon({ x: 5, y: -5 }, square)).toBe(false);
  });

  it("handles a concave ring", () => {
    // Right-pointing arrowhead with a notch at (3,5) on the left edge.
    const arrow: ScreenPoint[] = [
      { x: 0, y: 0 },
      { x: 10, y: 5 },
      { x: 0, y: 10 },
      { x: 3, y: 5 },
    ];
    expect(pointInPolygon({ x: 5, y: 4 }, arrow)).toBe(true); // in the body
    expect(pointInPolygon({ x: 1, y: 4 }, arrow)).toBe(false); // in the notch
    expect(pointInPolygon({ x: 9, y: 4 }, arrow)).toBe(false); // past the tip
  });
});

describe("pointInBox", () => {
  it("works regardless of corner order", () => {
    const a = { x: 10, y: 10 };
    const b = { x: 0, y: 0 };
    expect(pointInBox({ x: 5, y: 5 }, a, b)).toBe(true);
    expect(pointInBox({ x: 5, y: 5 }, b, a)).toBe(true);
  });

  it("includes the boundary and rejects outside points", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 10 };
    expect(pointInBox({ x: 0, y: 0 }, a, b)).toBe(true);
    expect(pointInBox({ x: 11, y: 5 }, a, b)).toBe(false);
  });
});

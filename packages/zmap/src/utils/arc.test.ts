import { describe, expect, it } from "vitest";
import { generateArc } from "./arc";
import type { LngLatTuple } from "./geojson";

const A: LngLatTuple = [-74, 40.7];
const B: LngLatTuple = [-0.1, 51.5];

describe("generateArc", () => {
  it("returns points + 1 coordinates for a bezier arc", () => {
    const coords = generateArc(A, B, { points: 32, type: "bezier" });
    expect(coords).toHaveLength(33);
  });

  it("keeps the endpoints anchored to from/to", () => {
    const coords = generateArc(A, B, { points: 16 });
    expect(coords[0][0]).toBeCloseTo(A[0], 6);
    expect(coords[0][1]).toBeCloseTo(A[1], 6);
    expect(coords[coords.length - 1][0]).toBeCloseTo(B[0], 6);
    expect(coords[coords.length - 1][1]).toBeCloseTo(B[1], 6);
  });

  it("draws a straight line when curvature is 0", () => {
    const coords = generateArc(A, B, { curvature: 0, points: 10 });
    const mid = coords[5];
    const expectedX = (A[0] + B[0]) / 2;
    const expectedY = (A[1] + B[1]) / 2;
    expect(mid[0]).toBeCloseTo(expectedX, 6);
    expect(mid[1]).toBeCloseTo(expectedY, 6);
  });

  it("bulges off the chord for positive curvature", () => {
    const coords = generateArc(A, B, { curvature: 0.5, points: 10 });
    const mid = coords[5];
    const chordY = (A[1] + B[1]) / 2;
    expect(mid[1]).not.toBeCloseTo(chordY, 3);
  });

  it("handles identical endpoints in geodesic mode", () => {
    const coords = generateArc(A, A, { type: "geodesic" });
    expect(coords).toEqual([A, A]);
  });

  it("produces points near the chord for a geodesic arc", () => {
    const coords = generateArc(A, B, { type: "geodesic", points: 8 });
    expect(coords).toHaveLength(9);
    expect(coords[0][0]).toBeCloseTo(A[0], 4);
    expect(coords[8][0]).toBeCloseTo(B[0], 4);
  });
});

import { describe, expect, it } from "vitest";
import type { LayerInput } from "../hooks/useMapLayer";
import { applyLayerOverrides } from "./layerOverrides";

const layers: LayerInput[] = [
  {
    id: "x-fill",
    type: "fill",
    paint: { "fill-color": "#111", "fill-opacity": 0.5 },
  } as LayerInput,
  {
    id: "x-line",
    type: "line",
    paint: { "line-color": "#222" },
  } as LayerInput,
];

describe("applyLayerOverrides", () => {
  it("returns the input untouched when no overrides are given", () => {
    expect(applyLayerOverrides(layers, undefined)).toBe(layers);
  });

  it("shallow-merges paint per role, overrides winning", () => {
    const out = applyLayerOverrides(layers, {
      fill: { paint: { "fill-opacity": 0.9, "fill-antialias": false } },
    });
    expect(out[0]).toMatchObject({
      paint: {
        "fill-color": "#111",
        "fill-opacity": 0.9,
        "fill-antialias": false,
      },
    });
    expect(out[1]).toBe(layers[1]); // untouched role keeps identity
  });

  it("adds layout when the base layer had none", () => {
    const out = applyLayerOverrides(layers, {
      line: { layout: { "line-cap": "round" } },
    });
    expect(out[1]).toMatchObject({ layout: { "line-cap": "round" } });
  });

  it("supports a custom roleOf mapping", () => {
    const out = applyLayerOverrides(
      layers,
      { surface: { paint: { "fill-opacity": 1 } } },
      (id) => (id.endsWith("-fill") ? "surface" : "other"),
    );
    expect(out[0]).toMatchObject({ paint: { "fill-opacity": 1 } });
  });

  it("does not mutate the original layer specs", () => {
    applyLayerOverrides(layers, { fill: { paint: { "fill-opacity": 1 } } });
    expect(
      (layers[0] as { paint: Record<string, unknown> }).paint["fill-opacity"],
    ).toBe(0.5);
  });
});

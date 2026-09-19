import { describe, expect, it } from "vitest";
import { CONTROL_OFFSETS } from "./controlPosition";

describe("controlPosition", () => {
  it("CONTROL_OFFSETS use inset-inline properties, never left/right", () => {
    for (const offsets of Object.values(CONTROL_OFFSETS)) {
      expect(offsets).not.toHaveProperty("left");
      expect(offsets).not.toHaveProperty("right");
      const keys = Object.keys(offsets);
      expect(
        keys.some((k) => k === "insetInlineStart" || k === "insetInlineEnd"),
      ).toBe(true);
    }
  });

  it("mirrors top-left/top-right and bottom-left/bottom-right via inline-start/end", () => {
    expect(CONTROL_OFFSETS["top-left"]).toEqual({
      top: 8,
      insetInlineStart: 8,
    });
    expect(CONTROL_OFFSETS["top-right"]).toEqual({ top: 8, insetInlineEnd: 8 });
    expect(CONTROL_OFFSETS["bottom-left"]).toEqual({
      bottom: 8,
      insetInlineStart: 8,
    });
    expect(CONTROL_OFFSETS["bottom-right"]).toEqual({
      bottom: 8,
      insetInlineEnd: 8,
    });
  });
});

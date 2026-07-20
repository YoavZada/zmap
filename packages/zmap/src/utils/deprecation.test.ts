import { afterEach, describe, expect, it, vi } from "vitest";
import { resetDeprecationWarnings, warnDeprecatedProp } from "./deprecation";

afterEach(() => {
  resetDeprecationWarnings();
  vi.restoreAllMocks();
});

describe("warnDeprecatedProp", () => {
  it("warns once per component+prop pair", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    warnDeprecatedProp("ShapeLayer", "lineColor", "strokeColor");
    warnDeprecatedProp("ShapeLayer", "lineColor", "strokeColor");
    warnDeprecatedProp("ShapeLayer", "lineWidth", "strokeWidth");

    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain("lineColor");
    expect(warn.mock.calls[0][0]).toContain("strokeColor");
  });

  it("stays silent in production", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");

    warnDeprecatedProp("PointLayer", "color", "fillColor");

    expect(warn).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});

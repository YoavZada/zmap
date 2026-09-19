import { describe, expect, it } from "vitest";
import { enUS } from "./enUS";
import { heIL } from "./heIL";

// Representative args for the parameterized (function-valued) keys, used to
// sample a rendered string when checking for emptiness.
const SAMPLE_ARGS: Record<string, unknown[]> = {
  legendCategories: [3],
  legendColorScale: ["0", "10"],
  legendBelow: ["10"],
  legendAtLeast: ["10"],
  legendRange: ["0", "10"],
  playbackSpeedLabel: [1.5],
  clusterPointLabel: [1],
  copiedCoordinates: ["1, 2"],
};

describe("locales", () => {
  it("heIL has every enUS key with the same value type, and vice versa", () => {
    const enKeys = Object.keys(enUS).sort();
    const heKeys = Object.keys(heIL).sort();
    expect(heKeys).toEqual(enKeys);
    for (const key of enKeys) {
      const k = key as keyof typeof enUS;
      expect(typeof heIL[k]).toBe(typeof enUS[k]);
    }
  });

  it("has no empty strings (including sampled function output)", () => {
    for (const locale of [enUS, heIL]) {
      for (const [key, value] of Object.entries(locale)) {
        const rendered =
          typeof value === "function"
            ? (value as (...args: unknown[]) => string)(
                ...(SAMPLE_ARGS[key] ?? []),
              )
            : value;
        expect(typeof rendered).toBe("string");
        expect(
          (rendered as string).length,
          `${key} should not be empty`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

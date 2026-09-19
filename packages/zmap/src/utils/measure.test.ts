import { describe, expect, it } from "vitest";
import {
  formatArea,
  formatDistance,
  haversineDistance,
  lineDistance,
  localeUnitLabels,
  polygonArea,
} from "./measure";
import type { LngLatTuple } from "./geojson";
import { enUS } from "../locales/enUS";

const NY: LngLatTuple = [-74.006, 40.7128];
const LDN: LngLatTuple = [-0.1276, 51.5072];

describe("haversineDistance", () => {
  it("returns ~0 for identical points", () => {
    expect(haversineDistance(NY, NY)).toBeCloseTo(0, 6);
  });

  it("matches the known NY↔London great-circle distance (~5570 km)", () => {
    const km = haversineDistance(NY, LDN) / 1000;
    expect(km).toBeGreaterThan(5560);
    expect(km).toBeLessThan(5590);
  });

  it("is symmetric", () => {
    expect(haversineDistance(NY, LDN)).toBeCloseTo(
      haversineDistance(LDN, NY),
      3,
    );
  });
});

describe("lineDistance", () => {
  it("is 0 for fewer than two points", () => {
    expect(lineDistance([])).toBe(0);
    expect(lineDistance([NY])).toBe(0);
  });

  it("sums its segments", () => {
    const mid: LngLatTuple = [-40, 48];
    const direct = haversineDistance(NY, mid) + haversineDistance(mid, LDN);
    expect(lineDistance([NY, mid, LDN])).toBeCloseTo(direct, 6);
  });
});

describe("polygonArea", () => {
  it("is 0 for degenerate rings", () => {
    expect(polygonArea([])).toBe(0);
    expect(
      polygonArea([
        [0, 0],
        [1, 1],
      ]),
    ).toBe(0);
  });

  it("matches the analytic area of a 1°×1° box at the equator (~1.239e10 m²)", () => {
    const box: LngLatTuple[] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    // R²·Δλ·(sinφ2 − sinφ1) with R = 6378137 m.
    const expected = 6378137 ** 2 * (Math.PI / 180) * Math.sin(Math.PI / 180);
    expect(polygonArea(box)).toBeCloseTo(expected, -3);
  });

  it("ignores winding order", () => {
    const cw: LngLatTuple[] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    const ccw: LngLatTuple[] = [...cw].reverse();
    expect(polygonArea(cw)).toBeCloseTo(polygonArea(ccw), 3);
  });
});

describe("formatDistance", () => {
  it("formats metric below/above 1 km", () => {
    expect(formatDistance(850)).toBe("850 m");
    expect(formatDistance(1500)).toBe("1.50 km");
  });

  it("formats imperial below/above 1 mile", () => {
    expect(formatDistance(100, "imperial")).toBe("328 ft");
    expect(formatDistance(2000, "imperial")).toBe("1.24 mi");
  });
});

describe("formatArea", () => {
  it("formats metric below/above 1 km²", () => {
    expect(formatArea(5000)).toBe("5000 m²");
    expect(formatArea(2_500_000)).toBe("2.50 km²");
  });

  it("formats imperial in acres then square miles", () => {
    expect(formatArea(4046.8564224, "imperial")).toBe("1.00 ac");
    expect(formatArea(5_000_000, "imperial")).toBe("1.93 mi²");
  });
});

describe("locale-aware formatting", () => {
  it("formats with a de-DE decimal comma", () => {
    const text = formatDistance(1500, "metric", { locale: "de-DE" });
    // German uses a comma decimal separator: "1,50 km" (trailing zero kept —
    // see formatFixed, which mirrors the old toFixed(2) padding).
    expect(text).toContain("1,5");
    expect(text.endsWith(" km")).toBe(true);
  });

  it("uses custom unit labels", () => {
    const text = formatDistance(1500, "metric", {
      units: { kilometers: "ק״מ" },
    });
    expect(text.endsWith(" ק״מ")).toBe(true);
  });

  it("defaults match the previous output", () => {
    expect(formatDistance(850)).toBe("850 m");
    expect(formatDistance(1500)).toBe("1.50 km");
    expect(formatArea(5000)).toBe("5000 m²");
    expect(formatArea(2_500_000)).toBe("2.50 km²");
  });

  it("localeUnitLabels maps every ZmapLocaleText unit key", () => {
    expect(localeUnitLabels(enUS)).toEqual({
      meters: enUS.unitMeters,
      kilometers: enUS.unitKilometers,
      feet: enUS.unitFeet,
      miles: enUS.unitMiles,
      squareMeters: enUS.unitSquareMeters,
      squareKilometers: enUS.unitSquareKilometers,
      acres: enUS.unitAcres,
      squareMiles: enUS.unitSquareMiles,
    });
  });
});

import { describe, expect, it } from "vitest";
import type { GeocodingProvider } from "./types";
import { geocoders, resolveGeocoder } from "./index";

describe("resolveGeocoder", () => {
  it("resolves built-in ids to their provider objects", () => {
    expect(resolveGeocoder("photon")).toBe(geocoders.photon);
    expect(resolveGeocoder("nominatim")).toBe(geocoders.nominatim);
  });

  it("passes custom providers through unchanged", () => {
    const custom: GeocodingProvider = {
      id: "custom",
      search: async () => [],
    };
    expect(resolveGeocoder(custom)).toBe(custom);
  });
});

import { describe, expect, it } from "vitest";
import {
  providerKey,
  resolveAttribution,
  resolveStyle,
  type MapProvider,
} from "./index";

describe("resolveStyle", () => {
  it("returns CARTO positron for carto/light", () => {
    expect(resolveStyle("carto", "light")).toContain("positron");
  });

  it("returns CARTO dark-matter for carto/dark", () => {
    expect(resolveStyle("carto", "dark")).toContain("dark-matter");
  });

  it("builds an OSM raster style spec", () => {
    const style = resolveStyle("osm", "light");
    expect(typeof style).toBe("object");
    if (typeof style === "object") {
      expect(style.version).toBe(8);
      expect(style.layers[0].type).toBe("raster");
    }
  });

  it("passes a raw style URL through unchanged", () => {
    const url = "https://example.com/style.json";
    expect(resolveStyle(url, "light")).toBe(url);
  });

  it("delegates to a custom MapProvider", () => {
    const custom: MapProvider = {
      id: "custom",
      getStyle: (mode) => `https://tiles/${mode}.json`,
    };
    expect(resolveStyle(custom, "dark")).toBe("https://tiles/dark.json");
  });
});

describe("providerKey", () => {
  it("keys built-in ids", () => {
    expect(providerKey("carto")).toBe("id:carto");
  });
  it("keys custom providers by id", () => {
    const custom: MapProvider = { id: "abc", getStyle: () => "x" };
    expect(providerKey(custom)).toBe("provider:abc");
  });
});

describe("resolveAttribution", () => {
  it("returns attribution for built-ins", () => {
    expect(resolveAttribution("carto")).toContain("CARTO");
    expect(resolveAttribution("osm")).toContain("OpenStreetMap");
  });
});

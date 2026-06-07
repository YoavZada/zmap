import { describe, expect, it } from "vitest";
import {
  maptiler,
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

  it("builds an OpenTopoMap raster style spec", () => {
    const style = resolveStyle("opentopomap", "light");
    expect(typeof style).toBe("object");
    if (typeof style === "object") {
      expect(style.version).toBe(8);
      expect(style.layers[0].type).toBe("raster");
    }
  });

  it("returns VersaTiles colorful for versatiles/light", () => {
    expect(resolveStyle("versatiles", "light")).toContain("colorful");
  });

  it("returns VersaTiles eclipse for versatiles/dark", () => {
    expect(resolveStyle("versatiles", "dark")).toContain("eclipse");
  });

  it("builds a keyed MapTiler URL tracking the color mode", () => {
    const provider = maptiler("KEY123");
    expect(resolveStyle(provider, "light")).toBe(
      "https://api.maptiler.com/maps/dataviz-light/style.json?key=KEY123",
    );
    expect(resolveStyle(provider, "dark")).toContain("dataviz-dark");
  });

  it("lets MapTiler swap the base style", () => {
    expect(resolveStyle(maptiler("KEY123", "streets-v2"), "dark")).toContain(
      "streets-v2-dark",
    );
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
  it("keys a MapTiler factory provider by its style-scoped id", () => {
    expect(providerKey(maptiler("KEY123", "streets-v2"))).toBe(
      "provider:maptiler:streets-v2",
    );
  });
});

describe("resolveAttribution", () => {
  it("returns attribution for built-ins", () => {
    expect(resolveAttribution("carto")).toContain("CARTO");
    expect(resolveAttribution("osm")).toContain("OpenStreetMap");
    expect(resolveAttribution("versatiles")).toContain("VersaTiles");
    expect(resolveAttribution("opentopomap")).toContain("OpenTopoMap");
  });
  it("returns attribution for a keyed MapTiler provider", () => {
    expect(resolveAttribution(maptiler("KEY123"))).toContain("MapTiler");
  });
});

import { describe, expect, it } from "vitest";
import {
  arcgis,
  maptiler,
  providerKey,
  resolveAttribution,
  resolveStyle,
  type MapProvider,
} from "./index";

const ARCGIS_BASE =
  "https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles";

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

describe("arcgis", () => {
  it("defaults to light-gray, tokenised, and pairs it with dark-gray", () => {
    const provider = arcgis("KEY123");
    expect(resolveStyle(provider, "light")).toBe(
      `${ARCGIS_BASE}/arcgis/light-gray?token=KEY123`,
    );
    expect(resolveStyle(provider, "dark")).toBe(
      `${ARCGIS_BASE}/arcgis/dark-gray?token=KEY123`,
    );
  });

  it.each([
    ["arcgis/light-gray", "arcgis/dark-gray"],
    ["arcgis/streets", "arcgis/streets-night"],
    ["arcgis/navigation", "arcgis/navigation-night"],
    ["arcgis/human-geography", "arcgis/human-geography-dark"],
    ["open/light-gray", "open/dark-gray"],
    ["open/streets", "open/streets-night"],
    ["open/navigation", "open/navigation-dark"],
  ])("pairs %s with %s in dark mode", (light, dark) => {
    const provider = arcgis("K", light);
    expect(resolveStyle(provider, "light")).toContain(`/styles/${light}?`);
    expect(resolveStyle(provider, "dark")).toContain(`/styles/${dark}?`);
  });

  it.each(["arcgis/imagery", "arcgis/topographic", "open/osm-style"])(
    "reuses %s in both modes when it has no dark twin",
    (style) => {
      const provider = arcgis("K", style);
      expect(resolveStyle(provider, "dark")).toBe(
        resolveStyle(provider, "light"),
      );
      expect(resolveStyle(provider, "light")).toContain(`/styles/${style}?`);
    },
  );

  it("honours an explicit { light, dark } pair", () => {
    const provider = arcgis("K", {
      light: "arcgis/topographic",
      dark: "arcgis/nova",
    });
    expect(resolveStyle(provider, "light")).toContain("/arcgis/topographic?");
    expect(resolveStyle(provider, "dark")).toContain("/arcgis/nova?");
  });

  it("forwards language, worldview and places as query params", () => {
    const provider = arcgis("K", undefined, {
      language: "fr",
      worldview: "unitedStatesOfAmerica",
      places: "attributed",
    });
    expect(resolveStyle(provider, "light")).toBe(
      `${ARCGIS_BASE}/arcgis/light-gray?token=K&language=fr&worldview=unitedStatesOfAmerica&places=attributed`,
    );
  });

  it("url-encodes preference values", () => {
    expect(
      resolveStyle(arcgis("K", undefined, { language: "a b" }), "light"),
    ).toContain("language=a+b");
  });

  it("adds nothing for unset preferences", () => {
    expect(resolveStyle(arcgis("K", "arcgis/streets", {}), "light")).toBe(
      `${ARCGIS_BASE}/arcgis/streets?token=K`,
    );
  });

  it("exposes Esri attribution", () => {
    expect(resolveAttribution(arcgis("K"))).toContain("Esri");
  });
});

describe("providerKey", () => {
  it("keys built-in ids", () => {
    expect(providerKey("carto")).toBe("id:carto");
  });

  it("keys an ArcGIS provider by its styles, never by its key", () => {
    const key = providerKey(arcgis("SECRET"));
    expect(key).toBe("provider:arcgis:arcgis/light-gray|arcgis/dark-gray");
    expect(key).not.toContain("SECRET");
  });

  it("gives a string style and its equivalent explicit pair the same key", () => {
    expect(providerKey(arcgis("K", "arcgis/streets"))).toBe(
      providerKey(
        arcgis("K", { light: "arcgis/streets", dark: "arcgis/streets-night" }),
      ),
    );
  });

  it("changes the ArcGIS key when preferences change", () => {
    const plain = providerKey(arcgis("K"));
    const french = providerKey(arcgis("K", undefined, { language: "fr" }));
    expect(french).not.toBe(plain);
    expect(french).toContain("language=fr");
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

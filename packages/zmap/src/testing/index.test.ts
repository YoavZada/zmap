// Public surface test for the `zmapgl/testing` subpath: consumers reach this
// module via `vi.mock("maplibre-gl", () => import("zmapgl/testing"))`, so its
// default export must look like the maplibre-gl module shape, and the named
// re-exports must include the pieces tests actually drive. Node env, no DOM:
// this only checks the export surface, not FakeMap's DOM-touching behavior
// (that's covered by testing/mockMaplibre.test.ts under jsdom).
import { describe, expect, it } from "vitest";
import maplibreDefault, { FakeMap, lastFakeMap } from "./index";

describe("zmapgl/testing default export", () => {
  it("exposes Map, Marker, Popup constructors and setRTLTextPlugin", () => {
    expect(maplibreDefault.Map).toBe(FakeMap);
    expect(typeof maplibreDefault.Marker).toBe("function");
    expect(typeof maplibreDefault.Popup).toBe("function");
    expect(typeof maplibreDefault.setRTLTextPlugin).toBe("function");
  });
});

describe("zmapgl/testing named exports", () => {
  it("includes FakeMap and lastFakeMap", () => {
    expect(typeof FakeMap).toBe("function");
    expect(typeof lastFakeMap).toBe("function");
  });
});

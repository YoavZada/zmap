// @vitest-environment jsdom
// FakeMap/FakePopup construct real DOM nodes (canvas, container, popup
// element) via `document`, so this file needs jsdom even though it's testing
// plain utility behaviour rather than React — see FakeMap's `canvas` field.
import { describe, expect, it } from "vitest";
import maplibreDefault, {
  FakeLngLat,
  FakeMap,
  FakePopup,
} from "./mockMaplibre";

describe("FakeMap camera constraints", () => {
  it("records constraint setters into `constraints` and returns getters, chainably", () => {
    const map = new FakeMap();

    expect(map.setMinZoom(2)).toBe(map);
    expect(map.setMaxZoom(18)).toBe(map);
    expect(map.setMinPitch(0)).toBe(map);
    expect(map.setMaxPitch(60)).toBe(map);
    const bounds = [
      [-1, -1],
      [1, 1],
    ];
    expect(map.setMaxBounds(bounds)).toBe(map);

    expect(map.getMinZoom()).toBe(2);
    expect(map.getMaxZoom()).toBe(18);
    expect(map.getMinPitch()).toBe(0);
    expect(map.getMaxPitch()).toBe(60);
    expect(map.getMaxBounds()).toBe(bounds);
    expect(map.constraints).toEqual({
      minZoom: 2,
      maxZoom: 18,
      minPitch: 0,
      maxPitch: 60,
      maxBounds: bounds,
    });
  });
});

describe("FakeMap.setLayerZoomRange", () => {
  it("records the [min, max] pair per layer id and is chainable", () => {
    const map = new FakeMap();

    expect(map.setLayerZoomRange("roads", 5, 12)).toBe(map);
    map.setLayerZoomRange("water", null, 8);

    expect(map.zoomRanges.get("roads")).toEqual([5, 12]);
    expect(map.zoomRanges.get("water")).toEqual([null, 8]);
  });
});

describe("FakeMap.getContainer", () => {
  it("returns a real HTMLDivElement that tests can redefine properties on", () => {
    const map = new FakeMap();
    const container = map.getContainer();

    expect(container).toBeInstanceOf(HTMLDivElement);
    Object.defineProperty(container, "clientHeight", { value: 400 });
    expect(container.clientHeight).toBe(400);
  });

  it("uses options.container when it is already an element", () => {
    const el = document.createElement("div");
    const map = new FakeMap({ container: el });
    expect(map.getContainer()).toBe(el);
  });
});

describe("FakeMap project/unproject", () => {
  it("round-trips through the identity projection", () => {
    const map = new FakeMap();
    const point = map.project([12, 34]);
    const lngLat = map.unproject([point.x, point.y]);
    expect(lngLat.lng).toBe(12);
    expect(lngLat.lat).toBe(34);
  });

  it("distanceTo is 0 for the same point", () => {
    const map = new FakeMap();
    const a = map.unproject([10, 20]);
    const b = map.unproject([10, 20]);
    expect(a.distanceTo(b)).toBe(0);
  });

  it("distanceTo approximates 111km per degree of latitude", () => {
    const map = new FakeMap();
    const a = map.unproject([0, 0]);
    const b = map.unproject([0, 1]);
    expect(a.distanceTo(b)).toBeGreaterThan(110_000);
    expect(a.distanceTo(b)).toBeLessThan(112_000);
  });

  it("exports FakeLngLat as the return type's constructor", () => {
    const map = new FakeMap();
    const lngLat = map.unproject([1, 2]);
    expect(lngLat).toBeInstanceOf(FakeLngLat);
  });
});

describe("FakeMap.resize", () => {
  it("fires a resize event", () => {
    const map = new FakeMap();
    let fired = false;
    map.on("resize", () => {
      fired = true;
    });

    expect(map.resize()).toBe(map);
    expect(fired).toBe(true);
  });
});

describe("FakeMap.getBounds", () => {
  it("returns a box ±1 degree around the current center", () => {
    const map = new FakeMap({ center: [10, 20] });
    const bounds = map.getBounds();

    expect(bounds.getWest()).toBe(9);
    expect(bounds.getEast()).toBe(11);
    expect(bounds.getSouth()).toBe(19);
    expect(bounds.getNorth()).toBe(21);
    expect(bounds.toArray()).toEqual([
      [9, 19],
      [11, 21],
    ]);
  });
});

describe("FakeMap.getStyle", () => {
  it("reflects layers in layerOrder and current sources", () => {
    const map = new FakeMap();
    map.addSource("s1", { type: "geojson", data: null });
    const layer1 = { id: "l1", type: "fill", source: "s1" };
    const layer2 = { id: "l2", type: "line", source: "s1" };
    map.addLayer(layer1);
    map.addLayer(layer2);

    const style = map.getStyle();
    expect(style.layers.map((l) => (l as { id: string }).id)).toEqual([
      "l1",
      "l2",
    ]);
    expect(Object.keys(style.sources)).toEqual(["s1"]);
  });
});

describe("FakeMap.once", () => {
  it("fires exactly once then unsubscribes", () => {
    const map = new FakeMap();
    let calls = 0;
    expect(
      map.once("click", () => {
        calls += 1;
      }),
    ).toBe(map);

    map.fire("click");
    map.fire("click");

    expect(calls).toBe(1);
    expect(map.handlerCount("click")).toBe(0);
  });
});

describe("FakeMap.setTransformRequest", () => {
  it("is a chainable vi.fn", () => {
    const map = new FakeMap();
    expect(map.setTransformRequest(() => ({}))).toBe(map);
  });
});

describe("FakeMap gesture handlers", () => {
  it.each([
    "scrollZoom",
    "boxZoom",
    "dragRotate",
    "dragPan",
    "keyboard",
    "doubleClickZoom",
    "touchZoomRotate",
    "touchPitch",
    "cooperativeGestures",
  ] as const)("%s.enable/disable flips isEnabled()", (name) => {
    const map = new FakeMap();
    const handler = map[name];

    expect(handler.isEnabled()).toBe(true);
    handler.disable();
    expect(handler.isEnabled()).toBe(false);
    handler.enable();
    expect(handler.isEnabled()).toBe(true);
  });

  it("keeps existing spy-on-enable/disable usage working (e.g. useDraw, SelectControl)", () => {
    const map = new FakeMap();
    map.doubleClickZoom.disable();
    map.dragPan.disable();
    map.boxZoom.disable();

    expect(map.doubleClickZoom.disable).toHaveBeenCalled();
    expect(map.dragPan.disable).toHaveBeenCalled();
    expect(map.boxZoom.disable).toHaveBeenCalled();
  });
});

describe("FakePopup", () => {
  it("setOffset/setMaxWidth chain", () => {
    const popup = new FakePopup();
    expect(popup.setOffset(10)).toBe(popup);
    expect(popup.setMaxWidth("200px")).toBe(popup);
  });

  it("addClassName/removeClassName toggle the element's classList", () => {
    const popup = new FakePopup();
    popup.addClassName("dark-theme");
    expect(popup.getElement().classList.contains("dark-theme")).toBe(true);

    popup.removeClassName("dark-theme");
    expect(popup.getElement().classList.contains("dark-theme")).toBe(false);
  });

  it("isOpen is true between addTo and remove", () => {
    const popup = new FakePopup();
    expect(popup.isOpen()).toBe(false);

    popup.addTo({});
    expect(popup.isOpen()).toBe(true);

    popup.remove();
    expect(popup.isOpen()).toBe(false);
  });
});

describe("module-level RTL plugin stubs", () => {
  it("default export exposes setRTLTextPlugin and getRTLTextPluginStatus", async () => {
    expect(typeof maplibreDefault.setRTLTextPlugin).toBe("function");
    await maplibreDefault.setRTLTextPlugin("url", false);
    expect(maplibreDefault.getRTLTextPluginStatus()).toBe("unavailable");
  });
});

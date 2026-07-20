// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import type { FeatureCollection } from "geojson";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import TimePlayback, { type TimePlaybackProps } from "./TimePlayback";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const DATA: FeatureCollection = {
  type: "FeatureCollection",
  features: [0, 25, 50, 75, 100].map((t) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [t / 10, t / 10] },
    properties: { time: t },
  })),
};

function renderPlayback(map: FakeMap, props: Partial<TimePlaybackProps> = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(<TimePlayback id="tp" data={DATA} {...props} />, { wrapper });
}

/** The playhead value the trail filter was last driven by. */
function trailPlayhead(map: FakeMap): number {
  const filter = map.getFilter("tp-trail") as unknown[];
  // Cumulative form: ["<=", ["get","time"], playhead]
  return filter[2] as number;
}

describe("TimePlayback", () => {
  it("adds trail + head circle layers and applies initial filters", () => {
    const map = new FakeMap();
    renderPlayback(map);

    expect(map.getLayer("tp-trail")!.type).toBe("circle");
    expect(map.getLayer("tp-head")!.type).toBe("circle");
    expect(trailPlayhead(map)).toBe(0); // starts at the data's min time
  });

  it("starts at defaultPlayhead when given (uncontrolled)", () => {
    const map = new FakeMap();
    renderPlayback(map, { defaultPlayhead: 50 });
    expect(trailPlayhead(map)).toBe(50);
  });

  it("scrubbing updates the filters and reports through onTimeChange", () => {
    const map = new FakeMap();
    const onTimeChange = vi.fn();
    renderPlayback(map, { onTimeChange });

    fireEvent.change(screen.getByLabelText("Playhead"), {
      target: { value: 30 },
    });

    expect(onTimeChange).toHaveBeenCalledWith(30);
    expect(trailPlayhead(map)).toBe(30);
  });

  it("controlled playhead: renders from the prop and never self-updates", () => {
    const map = new FakeMap();
    const onTimeChange = vi.fn();
    const { rerender } = renderPlayback(map, { playhead: 25, onTimeChange });
    expect(trailPlayhead(map)).toBe(25);

    // Scrub asks the parent for 75 but the filter stays at the prop value.
    fireEvent.change(screen.getByLabelText("Playhead"), {
      target: { value: 75 },
    });
    expect(onTimeChange).toHaveBeenCalledWith(75);
    expect(trailPlayhead(map)).toBe(25);

    // Parent accepts: prop updates, filter follows.
    rerender(
      <MapContext.Provider value={{ map: map as never, loaded: true }}>
        <TimePlayback id="tp" data={DATA} playhead={75} />
      </MapContext.Provider>,
    );
    expect(trailPlayhead(map)).toBe(75);
  });

  it("toggling play reports through onPlayingChange", () => {
    const map = new FakeMap();
    const onPlayingChange = vi.fn();
    renderPlayback(map, { onPlayingChange });

    fireEvent.click(screen.getByLabelText("Play"));
    expect(onPlayingChange).toHaveBeenCalledWith(true);
    // Uncontrolled: the transport flips to Pause.
    expect(screen.getByLabelText("Pause")).toBeTruthy();
  });

  it("controlled playing: the transport reflects the prop, not the click", () => {
    const map = new FakeMap();
    const onPlayingChange = vi.fn();
    renderPlayback(map, { playing: false, onPlayingChange });

    fireEvent.click(screen.getByLabelText("Play"));
    expect(onPlayingChange).toHaveBeenCalledWith(true);
    // Parent hasn't accepted — still paused.
    expect(screen.getByLabelText("Play")).toBeTruthy();
  });

  it("autoplay starts the uncontrolled transport playing", () => {
    const map = new FakeMap();
    renderPlayback(map, { autoplay: true });
    expect(screen.getByLabelText("Pause")).toBeTruthy();
  });

  it("re-applies filters after a style swap re-adds the layers", () => {
    const map = new FakeMap();
    renderPlayback(map, { defaultPlayhead: 50 });

    map.filters.clear();
    map.fire("styledata");
    expect(trailPlayhead(map)).toBe(50);
  });

  it("honors beforeId and layerOverrides", () => {
    const map = new FakeMap();
    map.addLayer({ id: "labels" });
    renderPlayback(map, {
      beforeId: "labels",
      layerOverrides: { head: { paint: { "circle-blur": 1 } } },
    });

    expect(map.layerOrder).toEqual(["tp-trail", "tp-head", "labels"]);
    const paint = map.getLayer("tp-head")!.paint as Record<string, unknown>;
    expect(paint["circle-blur"]).toBe(1);
  });
});

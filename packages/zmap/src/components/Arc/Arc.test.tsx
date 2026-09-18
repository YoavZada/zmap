// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import { generateArc } from "../../utils/arc";
import type { LngLatTuple } from "../../utils/geojson";
import Arc, { type ArcProps } from "./Arc";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const FROM: LngLatTuple = [-74, 40.7];
const TO: LngLatTuple = [-0.1, 51.5];

type LineData = {
  features: { geometry: { coordinates: LngLatTuple[] } }[];
};

function renderArc(map: FakeMap, props: Partial<ArcProps> = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(<Arc from={FROM} to={TO} {...props} />, { wrapper });
}

describe("Arc", () => {
  it("renders a Route whose coordinates come from generateArc", () => {
    const map = new FakeMap();
    renderArc(map, { id: "arc1", curvature: 0.4, points: 16, type: "bezier" });

    const expected = generateArc(FROM, TO, {
      curvature: 0.4,
      points: 16,
      type: "bezier",
    });

    const source = map.getSource("arc1");
    expect(source).toBeDefined();
    const data = source?.data as LineData | undefined;
    expect(data?.features[0].geometry.coordinates).toEqual(expected);

    const layer = map.getLayer("arc1-line");
    expect(layer?.type).toBe("line");
  });

  it("recomputes only when endpoints/curvature change", () => {
    const map = new FakeMap();
    const { rerender } = renderArc(map, { id: "arc1" });
    const source = map.getSource("arc1")!;
    const callsAfterMount = source.setData.mock.calls.length;

    // Unrelated prop change (color) — coordinates are unaffected, so no
    // extra recompute/setData beyond what mount already did.
    rerender(<Arc from={FROM} to={TO} id="arc1" color="secondary.main" />);
    expect(source.setData.mock.calls.length).toBe(callsAfterMount);

    // Curvature change — endpoints unaffected but the curve itself must
    // recompute and push new data.
    rerender(<Arc from={FROM} to={TO} id="arc1" curvature={0.7} />);
    expect(source.setData.mock.calls.length).toBe(callsAfterMount + 1);

    const expected = generateArc(FROM, TO, { curvature: 0.7 });
    const lastCall = source.setData.mock.calls.at(-1)?.[0] as
      | LineData
      | undefined;
    expect(lastCall?.features[0].geometry.coordinates).toEqual(expected);
  });
});

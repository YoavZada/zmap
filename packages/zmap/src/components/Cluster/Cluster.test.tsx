// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, act, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import Cluster, { type ClusterProps } from "./Cluster";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const POINTS = [
  { longitude: 0, latitude: 0, properties: { sales: 10 } },
  { longitude: 1, latitude: 1, properties: { sales: 5 } },
];

function renderCluster(map: FakeMap, props: Partial<ClusterProps> = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(<Cluster id="c" points={POINTS} {...props} />, { wrapper });
}

describe("Cluster", () => {
  it("creates a clustered source with radius and maxZoom", () => {
    const map = new FakeMap();
    renderCluster(map, { radius: 72, maxZoom: 10 });

    expect(map.getSource("c")!.options).toMatchObject({
      cluster: true,
      clusterRadius: 72,
      clusterMaxZoom: 10,
    });
    expect(map.getSource("c")!.options.clusterProperties).toBeUndefined();
  });

  it("passes clusterProperties through to the source", () => {
    const map = new FakeMap();
    renderCluster(map, {
      clusterProperties: { sales: ["+", ["get", "sales"]] },
    });

    expect(map.getSource("c")!.options.clusterProperties).toEqual({
      sales: ["+", ["get", "sales"]],
    });
  });

  it("hands aggregated properties to renderCluster", () => {
    const map = new FakeMap();
    map.sourceFeatures = [
      {
        geometry: { type: "Point", coordinates: [0.5, 0.5] },
        properties: {
          cluster: true,
          cluster_id: 1,
          point_count: 2,
          sales: 15,
        },
      },
    ];
    const renderClusterFn = vi.fn(
      (count: number, _expand: () => void, props: Record<string, unknown>) => (
        <div data-testid="bubble">{`${count}:${props.sales}`}</div>
      ),
    );
    renderCluster(map, { renderCluster: renderClusterFn });

    act(() => {
      map.fire("idle");
    });

    expect(screen.getByTestId("bubble").textContent).toBe("2:15");
    expect(renderClusterFn).toHaveBeenCalledWith(
      2,
      expect.any(Function),
      expect.objectContaining({ sales: 15, point_count: 2 }),
    );
  });
});

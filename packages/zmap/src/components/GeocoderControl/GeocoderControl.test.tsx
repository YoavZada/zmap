// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MapContext } from "../../context/MapContext";
import type {
  GeocodeResult,
  GeocodingProvider,
} from "../../providers/geocoding";
import {
  FakeMap,
  fakeMarkers,
  resetFakeMarkers,
} from "../../test/mockMaplibre";
import GeocoderControl, { type GeocoderControlProps } from "./GeocoderControl";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const BERLIN: GeocodeResult = {
  id: "n:1",
  name: "Berlin",
  address: "Germany",
  center: [13.3888, 52.517],
};
const BAVARIA: GeocodeResult = {
  id: "r:2",
  name: "Bavaria",
  address: "Germany",
  center: [11.4979, 48.7904],
  bbox: [8.9771, 47.2703, 13.8397, 50.5647],
};

function makeProvider(results: GeocodeResult[]): GeocodingProvider {
  return {
    id: "test",
    debounceMs: 0,
    minQueryLength: 2,
    search: vi.fn(async () => results),
  };
}

function renderControl(
  map: FakeMap,
  props: Partial<GeocoderControlProps> = {},
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(
    <GeocoderControl provider={makeProvider([BERLIN])} {...props} />,
    { wrapper },
  );
}

async function searchAndPick(name: string) {
  const input = screen.getByRole("combobox");
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: "ber" } });
  const option = await screen.findByText(name);
  fireEvent.click(option);
}

beforeEach(() => {
  resetFakeMarkers();
});

describe("GeocoderControl", () => {
  it("renders a search input with the placeholder as accessible label", () => {
    renderControl(new FakeMap());
    expect(screen.getByPlaceholderText("Search places…")).toBeTruthy();
    expect(screen.getByRole("combobox")).toBeTruthy();
  });

  it("typing searches and lists results", async () => {
    renderControl(new FakeMap());
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "ber" } });
    expect(await screen.findByText("Berlin")).toBeTruthy();
    expect(screen.getByText("Germany")).toBeTruthy();
  });

  it("selecting flies to a bbox-less result and drops a marker", async () => {
    const map = new FakeMap();
    const onSelect = vi.fn();
    renderControl(map, { onSelect });
    await searchAndPick("Berlin");

    expect(map.flyTo).toHaveBeenCalledWith({
      center: BERLIN.center,
      zoom: 14,
    });
    expect(map.fitBounds).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith(BERLIN);
    await waitFor(() => expect(fakeMarkers).toHaveLength(1));
    expect(fakeMarkers[0].lngLat).toEqual(BERLIN.center);
  });

  it("uses fitBounds when the result has a bbox", async () => {
    const map = new FakeMap();
    renderControl(map, { provider: makeProvider([BAVARIA]) });
    await searchAndPick("Bavaria");

    expect(map.fitBounds).toHaveBeenCalledWith(
      [
        [8.9771, 47.2703],
        [13.8397, 50.5647],
      ],
      { padding: 40 },
    );
    expect(map.flyTo).not.toHaveBeenCalled();
  });

  it("honors the zoom prop", async () => {
    const map = new FakeMap();
    renderControl(map, { zoom: 10 });
    await searchAndPick("Berlin");
    expect(map.flyTo).toHaveBeenCalledWith({ center: BERLIN.center, zoom: 10 });
  });

  it("flyTo={false} moves nothing but still reports the selection", async () => {
    const map = new FakeMap();
    const onSelect = vi.fn();
    renderControl(map, { flyTo: false, onSelect });
    await searchAndPick("Berlin");

    expect(map.flyTo).not.toHaveBeenCalled();
    expect(map.fitBounds).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith(BERLIN);
  });

  it("marker={false} drops no marker", async () => {
    renderControl(new FakeMap(), { marker: false });
    await searchAndPick("Berlin");
    expect(fakeMarkers).toHaveLength(0);
  });

  it("clearing removes the marker and fires onClear", async () => {
    const onClear = vi.fn();
    renderControl(new FakeMap(), { onClear });
    await searchAndPick("Berlin");
    await waitFor(() => expect(fakeMarkers).toHaveLength(1));

    fireEvent.click(screen.getByLabelText("Clear"));
    expect(onClear).toHaveBeenCalled();
    await waitFor(() => expect(fakeMarkers[0].removed).toBe(true));
  });
});

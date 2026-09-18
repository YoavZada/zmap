// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  fakeMarkers,
  lastFakeMap,
  resetFakeMaps,
  resetFakeMarkers,
} from "../../test/mockMaplibre";
import Map from "../Map";
import ContextMenu from "./ContextMenu";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

const loadMap = () => {
  const map = lastFakeMap();
  act(() => {
    map.fire("load");
  });
  return map;
};

function openMenu(
  map: ReturnType<typeof lastFakeMap>,
  lngLat: { lng: number; lat: number } = { lng: 10, lat: 20 },
  point: { clientX: number; clientY: number } = { clientX: 100, clientY: 200 },
) {
  act(() => {
    map.fire("contextmenu", {
      preventDefault: () => {},
      lngLat,
      originalEvent: point,
    });
  });
}

beforeEach(() => {
  resetFakeMaps();
  resetFakeMarkers();
});

describe("ContextMenu", () => {
  it("opens the menu on map contextmenu at the pointer", () => {
    render(
      <Map>
        <ContextMenu />
      </Map>,
    );
    const map = loadMap();

    expect(screen.queryByRole("menu")).toBeNull();
    openMenu(map, { lng: 10, lat: 20 });
    expect(screen.getByRole("menu")).toBeTruthy();

    // "Center here" carries the map location the menu was opened at.
    fireEvent.click(screen.getByText("Center here"));
    expect(map.easeTo).toHaveBeenCalledWith({ center: [10, 20] });
  });

  it('"Copy coordinates" writes to the clipboard and shows a snackbar', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
      writable: true,
    });

    render(
      <Map>
        <ContextMenu />
      </Map>,
    );
    const map = loadMap();
    openMenu(map, { lng: 2.34945, lat: 48.85837 });

    fireEvent.click(screen.getByText("Copy coordinates"));

    expect(writeText).toHaveBeenCalledWith("48.85837, 2.34945");
    expect(await screen.findByText("Copied 48.85837, 2.34945")).toBeTruthy();
  });

  it("custom items replace the defaults unless defaultItems is true", () => {
    render(
      <Map>
        <ContextMenu items={[{ label: "Custom item" }]} />
      </Map>,
    );
    const map = loadMap();
    openMenu(map);

    expect(screen.getByText("Custom item")).toBeTruthy();
    expect(screen.queryByText("Center here")).toBeNull();
    expect(screen.queryByText("Copy coordinates")).toBeNull();
    expect(screen.queryByText("Drop marker")).toBeNull();
  });

  it("keeps the built-in items when defaultItems is set alongside custom items", () => {
    render(
      <Map>
        <ContextMenu items={[{ label: "Custom item" }]} defaultItems />
      </Map>,
    );
    const map = loadMap();
    openMenu(map);

    expect(screen.getByText("Custom item")).toBeTruthy();
    expect(screen.getByText("Center here")).toBeTruthy();
    expect(screen.getByText("Copy coordinates")).toBeTruthy();
    expect(screen.getByText("Drop marker")).toBeTruthy();
  });

  it('"Drop marker" renders a draggable Marker', () => {
    render(
      <Map>
        <ContextMenu />
      </Map>,
    );
    const map = loadMap();
    openMenu(map, { lng: 5, lat: 6 });

    fireEvent.click(screen.getByText("Drop marker"));

    expect(fakeMarkers).toHaveLength(1);
    expect(fakeMarkers[0]?.lngLat).toEqual([5, 6]);
    expect(fakeMarkers[0]?.options.draggable).toBe(true);
  });

  it("menu portals into the map container", () => {
    const { container } = render(
      <Map>
        <ContextMenu />
      </Map>,
    );
    const map = loadMap();
    openMenu(map);

    const region = container.querySelector('[role="region"]');
    const menu = screen.getByRole("menu");
    expect(region).not.toBeNull();
    expect(region?.contains(menu)).toBe(true);
  });
});

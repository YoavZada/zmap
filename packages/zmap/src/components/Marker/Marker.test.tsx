// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, act, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
import Marker, { type MarkerProps } from "./Marker";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

function renderMarker(map: FakeMap, props: Partial<MarkerProps> = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={children}
    />
  );
  return render(
    <Marker longitude={0} latitude={0} {...props}>
      <span>pin</span>
    </Marker>,
    { wrapper },
  );
}

describe("Marker accessibility", () => {
  it("interactive markers are keyboard-focusable buttons", () => {
    const map = new FakeMap();
    const onClick = vi.fn();
    renderMarker(map, { onClick, label: "Office" });

    const button = screen.getByRole("button", { name: "Office" });
    expect(button.tabIndex).toBe(0);

    act(() => {
      button.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    });
    expect(onClick).toHaveBeenCalledTimes(1);

    act(() => {
      button.dispatchEvent(
        new KeyboardEvent("keydown", { key: " ", bubbles: true }),
      );
    });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("interactive marker clicks do not bubble into a map click", () => {
    const map = new FakeMap();
    const onClick = vi.fn();
    renderMarker(map, { onClick, label: "Office" });

    // The marker element lives in the canvas container; if its click bubbled
    // there it would become a map click (and e.g. instantly close a
    // closeOnClick popup the handler just opened).
    const button = screen.getByRole("button", { name: "Office" });
    const containerClick = vi.fn();
    button.parentElement?.addEventListener("click", containerClick);

    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(containerClick).not.toHaveBeenCalled();
    button.parentElement?.removeEventListener("click", containerClick);
  });

  it("static marker clicks keep bubbling (map click still fires)", () => {
    const map = new FakeMap();
    renderMarker(map, { label: "Just a pin" });

    const el = screen.getByText("pin").parentElement!;
    const containerClick = vi.fn();
    document.body.addEventListener("click", containerClick);

    act(() => {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(containerClick).toHaveBeenCalledTimes(1);
    document.body.removeEventListener("click", containerClick);
  });

  it("static markers stay out of the tab order", () => {
    const map = new FakeMap();
    renderMarker(map, { label: "Just a pin" });

    expect(screen.queryByRole("button")).toBeNull();
    const el = screen.getByText("pin").parentElement!;
    expect(el.getAttribute("tabindex")).toBeNull();
  });

  it("a labeled static marker gets role=img instead of aria-label on a role-less div", () => {
    const map = new FakeMap();
    renderMarker(map, { label: "Just a pin" });

    // No onClick => not a button, but aria-label on a plain, role-less <div>
    // is invalid ARIA (axe: aria-prohibited-attr) — a static-but-labeled
    // marker gets role="img" instead, the correct role for a static labeled
    // graphic, so its aria-label stays a valid accessible name.
    const el = screen.getByRole("img", { name: "Just a pin" });
    expect(el.getAttribute("tabindex")).toBeNull();
  });

  it("gains and loses button semantics as onClick comes and goes", () => {
    const map = new FakeMap();
    const { rerender } = renderMarker(map);
    expect(screen.queryByRole("button")).toBeNull();

    rerender(
      <MapContext.Provider value={{ map: map as never, loaded: true }}>
        <Marker longitude={0} latitude={0} onClick={() => {}}>
          <span>pin</span>
        </Marker>
      </MapContext.Provider>,
    );
    expect(screen.getByRole("button")).toBeDefined();
  });
});

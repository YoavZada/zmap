// @vitest-environment jsdom
import { act, fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MapContext } from "../../context/MapContext";
import { FakeMap, fakePopups, lastFakePopup } from "../../test/mockMaplibre";
import Popup from "./Popup";

vi.mock("maplibre-gl", () => import("../../test/mockMaplibre"));

function renderPopup(
  props: Record<string, unknown> = {},
  children: ReactNode = <button type="button">Inside</button>,
) {
  const map = new FakeMap();
  const wrapper = ({ children: c }: { children: ReactNode }) => (
    <MapContext.Provider
      value={{ map: map as never, loaded: true }}
      children={c}
    />
  );
  return render(
    <Popup longitude={0} latitude={0} {...props}>
      {children}
    </Popup>,
    { wrapper },
  );
}

beforeEach(() => {
  fakePopups.length = 0;
});

describe("Popup a11y", () => {
  it("renders a labeled dialog and moves focus into it on open", () => {
    renderPopup();
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute("aria-modal")).toBe("false");
    expect(dialog.getAttribute("aria-label")).toBe("Map popup");
    // focus moved into the popup (the dialog container or its first focusable)
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("uses a custom ariaLabel", () => {
    renderPopup({ ariaLabel: "Station details" });
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.getAttribute("aria-label")).toBe("Station details");
  });

  it("Escape closes the popup (fires onClose)", () => {
    const onClose = vi.fn();
    renderPopup({ onClose });
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("returns focus to the previously focused element on close", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    const { unmount } = renderPopup();
    // focus moved into the popup on open
    expect(document.activeElement).not.toBe(trigger);
    unmount();
    expect(document.activeElement).toBe(trigger);
  });
});

describe("Popup open state & reactive options", () => {
  it("uncontrolled: closes itself when MapLibre fires close and calls onClose", () => {
    const onClose = vi.fn();
    renderPopup({ onClose });
    const popup = lastFakePopup();

    act(() => {
      popup.fire("close");
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(popup.isOpen()).toBe(false);
  });

  it("controlled: stays open after MapLibre close until the parent flips open", () => {
    const onClose = vi.fn();
    const { rerender } = renderPopup({ open: true, onClose });
    const popup = lastFakePopup();

    act(() => {
      popup.fire("close");
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(popup.isOpen()).toBe(true);
    expect(popup.removed).toBe(false);

    rerender(
      <Popup longitude={0} latitude={0} open={false} onClose={onClose}>
        <button type="button">Inside</button>
      </Popup>,
    );

    expect(popup.isOpen()).toBe(false);
  });

  it("defaultOpen={false} renders no popup until the key changes", () => {
    renderPopup({ defaultOpen: false });

    expect(fakePopups).toHaveLength(0);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("applies offset and maxWidth in place without recreating", () => {
    const { rerender } = renderPopup({ offset: 10, maxWidth: "200px" });
    const popup = lastFakePopup();

    rerender(
      <Popup longitude={0} latitude={0} offset={20} maxWidth="300px">
        <button type="button">Inside</button>
      </Popup>,
    );

    expect(popup.setOffset).toHaveBeenCalledWith(20);
    expect(popup.setMaxWidth).toHaveBeenCalledWith("300px");
    expect(fakePopups).toHaveLength(1);
    expect(lastFakePopup()).toBe(popup);
  });

  it("recreates when anchor or closeOnClick changes", () => {
    const { rerender } = renderPopup({ anchor: "top" });
    const popup = lastFakePopup();

    rerender(
      <Popup longitude={0} latitude={0} anchor="bottom">
        <button type="button">Inside</button>
      </Popup>,
    );

    expect(fakePopups).toHaveLength(2);
    expect(popup.removed).toBe(true);
    expect(lastFakePopup()).not.toBe(popup);
  });

  it("syncs className changes with add/removeClassName", () => {
    const { rerender } = renderPopup({ className: "foo" });
    const popup = lastFakePopup();

    rerender(
      <Popup longitude={0} latitude={0} className="bar">
        <button type="button">Inside</button>
      </Popup>,
    );

    expect(popup.getElement().classList.contains("bar")).toBe(true);
    expect(popup.getElement().classList.contains("foo")).toBe(false);
    expect(fakePopups).toHaveLength(1);
  });
});

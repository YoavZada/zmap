// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { MapContext } from "../../context/MapContext";
import { FakeMap } from "../../test/mockMaplibre";
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

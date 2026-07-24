// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FakeMap } from "../test/mockMaplibre";
import { useStyleReapply } from "./useStyleReapply";

describe("useStyleReapply", () => {
  it("applies on mount when loaded, and never before", () => {
    const map = new FakeMap();
    const apply = vi.fn();
    const { rerender } = renderHook(
      ({ loaded }) => useStyleReapply(map as never, loaded, apply),
      { initialProps: { loaded: false } },
    );
    expect(apply).not.toHaveBeenCalled();
    rerender({ loaded: true });
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledWith(map);
  });

  it("re-applies on styledata and idle only when the style is loaded", () => {
    const map = new FakeMap();
    const apply = vi.fn();
    renderHook(() => useStyleReapply(map as never, true, apply));
    expect(apply).toHaveBeenCalledTimes(1); // mount

    map.setStyleLoaded(false);
    map.fire("styledata");
    expect(apply).toHaveBeenCalledTimes(1); // skipped: style not loaded

    map.setStyleLoaded(true);
    map.fire("styledata");
    expect(apply).toHaveBeenCalledTimes(2);
    map.fire("idle");
    expect(apply).toHaveBeenCalledTimes(3);
  });

  it("runs cleanup and unsubscribes on unmount", () => {
    const map = new FakeMap();
    const apply = vi.fn();
    const cleanup = vi.fn();
    const { unmount } = renderHook(() =>
      useStyleReapply(map as never, true, apply, cleanup),
    );
    expect(map.handlerCount("styledata")).toBe(1);
    expect(map.handlerCount("idle")).toBe(1);

    unmount();
    expect(cleanup).toHaveBeenCalledWith(map);
    expect(map.handlerCount("styledata")).toBe(0);
    expect(map.handlerCount("idle")).toBe(0);
  });

  it("does not resubscribe when apply/cleanup change identity", () => {
    const map = new FakeMap();
    const { rerender } = renderHook(
      ({ apply }) => useStyleReapply(map as never, true, apply),
      { initialProps: { apply: vi.fn() } },
    );
    const before = map.handlerCount("styledata");
    rerender({ apply: vi.fn() }); // new identity
    expect(map.handlerCount("styledata")).toBe(before); // still 1, not 2
  });

  it("re-applies when the apply callback identity changes (prop-driven update)", () => {
    const map = new FakeMap();
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ apply }) => useStyleReapply(map as never, true, apply),
      { initialProps: { apply: first } },
    );
    expect(first).toHaveBeenCalledTimes(1);
    rerender({ apply: second }); // no map event
    expect(second).toHaveBeenCalledTimes(1);
  });
});

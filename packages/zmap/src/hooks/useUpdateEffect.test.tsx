// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUpdateEffect } from "./useUpdateEffect";

describe("useUpdateEffect", () => {
  it("skips the mount run and fires on dependency change", () => {
    const effect = vi.fn();
    const { rerender } = renderHook(
      ({ dep }) => useUpdateEffect(effect, [dep]),
      { initialProps: { dep: 1 } },
    );
    expect(effect).not.toHaveBeenCalled();

    rerender({ dep: 2 });
    expect(effect).toHaveBeenCalledTimes(1);

    // Same deps → no re-fire.
    rerender({ dep: 2 });
    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ dep: 3 });
    expect(effect).toHaveBeenCalledTimes(2);
  });
});

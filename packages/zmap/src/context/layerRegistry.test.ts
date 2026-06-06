import { describe, expect, it } from "vitest";
import {
  emptyLayerState,
  registerEntry,
  setEntryVisible,
  sortedEntries,
  unregisterEntry,
} from "./layerRegistry";

describe("layer registry", () => {
  it("registers with default visibility and registration order", () => {
    let s = emptyLayerState;
    s = registerEntry(s, { id: "a", label: "A" });
    s = registerEntry(s, { id: "b", label: "B", defaultVisible: false });
    const e = sortedEntries(s);
    expect(e.map((x) => x.id)).toEqual(["a", "b"]);
    expect(e[0].visible).toBe(true);
    expect(e[1].visible).toBe(false);
    expect(e[0].order).toBeLessThan(e[1].order);
  });

  it("preserves visibility + order when re-registering (metadata update)", () => {
    let s = registerEntry(emptyLayerState, { id: "a", label: "A" });
    s = setEntryVisible(s, "a", false);
    const order = s.entries["a"].order;
    s = registerEntry(s, { id: "a", label: "A renamed" });
    expect(s.entries["a"].label).toBe("A renamed");
    expect(s.entries["a"].visible).toBe(false);
    expect(s.entries["a"].order).toBe(order);
  });

  it("returns the same state reference when nothing changed", () => {
    const s = registerEntry(emptyLayerState, {
      id: "a",
      label: "A",
      color: "primary.main",
    });
    expect(
      registerEntry(s, { id: "a", label: "A", color: "primary.main" }),
    ).toBe(s);
  });

  it("no-ops setEntryVisible when unchanged or missing", () => {
    const s = registerEntry(emptyLayerState, { id: "a", label: "A" });
    expect(setEntryVisible(s, "a", true)).toBe(s);
    expect(setEntryVisible(s, "missing", false)).toBe(s);
  });

  it("unregisters (and no-ops when missing)", () => {
    let s = registerEntry(emptyLayerState, { id: "a", label: "A" });
    s = unregisterEntry(s, "a");
    expect(sortedEntries(s)).toEqual([]);
    expect(unregisterEntry(s, "a")).toBe(s);
  });

  it("keeps stable ordering across unregister + register", () => {
    let s = emptyLayerState;
    s = registerEntry(s, { id: "a", label: "A" });
    s = registerEntry(s, { id: "b", label: "B" });
    s = unregisterEntry(s, "a");
    s = registerEntry(s, { id: "c", label: "C" });
    expect(sortedEntries(s).map((x) => x.id)).toEqual(["b", "c"]);
  });
});

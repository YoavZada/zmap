import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the maplibre-gl default namespace's addProtocol + the pmtiles module.
const addProtocol = vi.fn();
vi.mock("maplibre-gl", () => ({
  default: { addProtocol },
}));
const tile = vi.fn();
vi.mock("pmtiles", () => ({
  Protocol: class {
    tile = tile;
  },
}));

describe("pmtiles", () => {
  beforeEach(() => {
    vi.resetModules();
    addProtocol.mockClear();
  });

  it("registers the pmtiles:// protocol exactly once (concurrent + repeat)", async () => {
    const mod = await import("./pmtiles");
    expect(mod.isPmtilesRegistered()).toBe(false);
    // Concurrent: both fire before the first resolves — exercises the in-flight guard.
    const [p1, p2] = [
      mod.registerPmtilesProtocol(),
      mod.registerPmtilesProtocol(),
    ];
    await Promise.all([p1, p2]);
    // Repeat after resolution — exercises the `registered` fast-path.
    await mod.registerPmtilesProtocol();
    expect(addProtocol).toHaveBeenCalledTimes(1);
    expect(addProtocol).toHaveBeenCalledWith("pmtiles", expect.any(Function));
    expect(mod.isPmtilesRegistered()).toBe(true);
  });

  it("resets after a failed registration so a later call can retry", async () => {
    const mod = await import("./pmtiles");
    // Arrange the first addProtocol call to throw once (transient failure).
    addProtocol.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    await expect(mod.registerPmtilesProtocol()).rejects.toThrow("boom");
    expect(mod.isPmtilesRegistered()).toBe(false);
    // Retry now succeeds.
    await mod.registerPmtilesProtocol();
    expect(mod.isPmtilesRegistered()).toBe(true);
    expect(addProtocol).toHaveBeenCalledTimes(2);
  });

  it("detects pmtiles:// in a style URL and in a StyleSpecification", async () => {
    const { usesPmtiles } = await import("./pmtiles");
    expect(usesPmtiles("pmtiles://https://x/y.pmtiles")).toBe(true);
    expect(usesPmtiles("https://x/style.json")).toBe(false);
    expect(
      usesPmtiles({
        version: 8,
        sources: {
          a: { type: "vector", url: "pmtiles://https://x/y.pmtiles" },
        },
        layers: [],
      } as never),
    ).toBe(true);
    expect(usesPmtiles({ version: 8, sources: {}, layers: [] } as never)).toBe(
      false,
    );
  });
});

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

  it("registers the pmtiles:// protocol exactly once (idempotent)", async () => {
    const mod = await import("./pmtiles");
    expect(mod.isPmtilesRegistered()).toBe(false);
    await mod.registerPmtilesProtocol();
    await mod.registerPmtilesProtocol();
    await Promise.all([
      mod.registerPmtilesProtocol(),
      mod.registerPmtilesProtocol(),
    ]);
    expect(addProtocol).toHaveBeenCalledTimes(1);
    expect(addProtocol).toHaveBeenCalledWith("pmtiles", expect.any(Function));
    expect(mod.isPmtilesRegistered()).toBe(true);
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

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the maplibre-gl default namespace's setRTLTextPlugin/getRTLTextPluginStatus.
// `status` is stateful (unlike pmtiles's addProtocol mock) so tests can exercise
// the "already registered by someone else" and "unavailable after failure" paths.
let status: string;
const setRTLTextPlugin = vi.fn(async (_url: string, _lazy?: boolean) => {
  status = "loaded";
});
const getRTLTextPluginStatus = vi.fn(() => status);
vi.mock("maplibre-gl", () => ({
  default: { setRTLTextPlugin, getRTLTextPluginStatus },
}));

describe("rtlTextPlugin", () => {
  beforeEach(() => {
    vi.resetModules();
    status = "unavailable";
    setRTLTextPlugin.mockClear();
    getRTLTextPluginStatus.mockClear();
  });

  it("registers the plugin once even when called concurrently", async () => {
    const mod = await import("./rtlTextPlugin");
    expect(mod.isRtlTextPluginRegistered()).toBe(false);
    // Both calls start before the first resolves. MapLibre flips the plugin
    // status synchronously inside setRTLTextPlugin, so the second call is
    // normally short-circuited by the status check; the in-flight promise is
    // the fallback for implementations that flip it later. Either way: one
    // real registration.
    const [p1, p2] = [mod.registerRtlTextPlugin(), mod.registerRtlTextPlugin()];
    await Promise.all([p1, p2]);
    expect(setRTLTextPlugin).toHaveBeenCalledTimes(1);
    expect(mod.isRtlTextPluginRegistered()).toBe(true);
  });

  it('is a no-op when the status is not "unavailable"', async () => {
    const mod = await import("./rtlTextPlugin");
    status = "loaded"; // registered by the consumer directly, outside this module
    await mod.registerRtlTextPlugin();
    expect(setRTLTextPlugin).not.toHaveBeenCalled();
  });

  it("resets after a failed load so it can retry", async () => {
    const mod = await import("./rtlTextPlugin");
    setRTLTextPlugin.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    await expect(mod.registerRtlTextPlugin()).rejects.toThrow("boom");
    expect(mod.isRtlTextPluginRegistered()).toBe(false);
    // Retry now succeeds.
    await mod.registerRtlTextPlugin();
    expect(mod.isRtlTextPluginRegistered()).toBe(true);
    expect(setRTLTextPlugin).toHaveBeenCalledTimes(2);
  });

  it("uses the default URL when none is given", async () => {
    const mod = await import("./rtlTextPlugin");
    await mod.registerRtlTextPlugin();
    expect(setRTLTextPlugin).toHaveBeenCalledWith(
      mod.DEFAULT_RTL_TEXT_PLUGIN_URL,
      true,
    );
  });
});

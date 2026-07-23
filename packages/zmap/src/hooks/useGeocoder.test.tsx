// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GeocodeResult, GeocodingProvider } from "../providers/geocoding";
import { useGeocoder } from "./useGeocoder";

const BERLIN: GeocodeResult = {
  id: "n:1",
  name: "Berlin",
  center: [13.3888, 52.517],
};
const PARIS: GeocodeResult = {
  id: "n:2",
  name: "Paris",
  center: [2.3522, 48.8566],
};

function makeProvider(
  overrides: Partial<GeocodingProvider> = {},
): GeocodingProvider & { search: ReturnType<typeof vi.fn> } {
  return {
    id: "test",
    debounceMs: 300,
    minQueryLength: 2,
    search: vi.fn(async () => [BERLIN]),
    ...overrides,
  } as GeocodingProvider & { search: ReturnType<typeof vi.fn> };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("useGeocoder", () => {
  it("debounces: no request before debounceMs, one after", async () => {
    vi.useFakeTimers();
    const provider = makeProvider();
    const { result } = renderHook(() => useGeocoder(provider));

    act(() => result.current.setQuery("ber"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(299);
    });
    expect(provider.search).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(provider.search).toHaveBeenCalledTimes(1);
    expect(provider.search).toHaveBeenCalledWith(
      "ber",
      expect.objectContaining({ limit: 5 }),
    );
    expect(result.current.results).toEqual([BERLIN]);
    expect(result.current.loading).toBe(false);
  });

  it("is loading during the debounce window, before the request fires", async () => {
    vi.useFakeTimers();
    const provider = makeProvider();
    const { result } = renderHook(() => useGeocoder(provider));

    act(() => result.current.setQuery("ber"));
    expect(result.current.loading).toBe(true);
    expect(provider.search).not.toHaveBeenCalled();

    act(() => result.current.setQuery("b")); // dip below min length
    expect(result.current.loading).toBe(false);

    act(() => result.current.setQuery("ber"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(result.current.loading).toBe(false); // settled
    expect(result.current.results).toEqual([BERLIN]);
  });

  it("never searches below minQueryLength and clears stale results", async () => {
    vi.useFakeTimers();
    const provider = makeProvider();
    const { result } = renderHook(() => useGeocoder(provider));

    act(() => result.current.setQuery("be"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(result.current.results).toEqual([BERLIN]);

    act(() => result.current.setQuery("b"));
    expect(result.current.results).toEqual([]);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(provider.search).toHaveBeenCalledTimes(1); // only the first query
  });

  it("aborts the in-flight request when retyping", async () => {
    vi.useFakeTimers();
    const signals: AbortSignal[] = [];
    const provider = makeProvider({
      search: vi.fn((_q: string, opts: { signal: AbortSignal }) => {
        signals.push(opts.signal);
        return new Promise<GeocodeResult[]>(() => {}); // never settles
      }) as never,
    });
    const { result } = renderHook(() => useGeocoder(provider));

    act(() => result.current.setQuery("ber"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    act(() => result.current.setQuery("berl"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(signals).toHaveLength(2);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it("drops responses that resolve after being superseded", async () => {
    vi.useFakeTimers();
    let resolveFirst: (r: GeocodeResult[]) => void = () => {};
    const provider = makeProvider({
      search: vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise<GeocodeResult[]>((resolve) => {
              resolveFirst = resolve;
            }),
        )
        .mockResolvedValueOnce([PARIS]) as never,
    });
    const { result } = renderHook(() => useGeocoder(provider));

    act(() => result.current.setQuery("be"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    act(() => result.current.setQuery("pa"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(result.current.results).toEqual([PARIS]);

    await act(async () => {
      resolveFirst([BERLIN]); // stale response lands late
    });
    expect(result.current.results).toEqual([PARIS]);
  });

  it("clear() aborts, and resets query/results/error", async () => {
    vi.useFakeTimers();
    const provider = makeProvider();
    const { result } = renderHook(() => useGeocoder(provider));

    act(() => result.current.setQuery("ber"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(result.current.results).toEqual([BERLIN]);

    act(() => result.current.clear());
    expect(result.current.query).toBe("");
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("surfaces provider errors and clears results", async () => {
    vi.useFakeTimers();
    const provider = makeProvider({
      search: vi.fn().mockRejectedValue(new Error("boom")) as never,
    });
    const { result } = renderHook(() => useGeocoder(provider));

    act(() => result.current.setQuery("ber"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(result.current.error?.message).toBe("boom");
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("invokes a proximity getter at request time, not at setQuery time", async () => {
    vi.useFakeTimers();
    const provider = makeProvider();
    const proximity = vi.fn(() => [10, 20] as [number, number]);
    const { result } = renderHook(() => useGeocoder(provider, { proximity }));

    act(() => result.current.setQuery("ber"));
    expect(proximity).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(proximity).toHaveBeenCalledTimes(1);
    expect(provider.search).toHaveBeenCalledWith(
      "ber",
      expect.objectContaining({ proximity: [10, 20] }),
    );
  });
});

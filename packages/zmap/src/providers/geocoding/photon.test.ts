import { afterEach, describe, expect, it, vi } from "vitest";
import { photon } from "./photon";

const BERLIN_FIXTURE = {
  features: [
    {
      geometry: { coordinates: [13.3888599, 52.5170365] },
      properties: {
        osm_type: "N",
        osm_id: 240109189,
        osm_key: "place",
        osm_value: "city",
        name: "Berlin",
        state: "Berlin",
        country: "Germany",
        extent: [13.088345, 52.6755087, 13.7611609, 52.3382448],
      },
    },
  ],
};

function stubFetch(body: unknown, ok = true, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("photon", () => {
  it("declares autocomplete-friendly defaults", () => {
    expect(photon.id).toBe("photon");
    expect(photon.debounceMs).toBe(300);
    expect(photon.minQueryLength).toBe(2);
  });

  it("builds the request URL from options and forwards the signal", async () => {
    const fetchMock = stubFetch({ features: [] });
    const controller = new AbortController();
    await photon.search("berlin", {
      signal: controller.signal,
      limit: 5,
      language: "en",
      proximity: [13.4, 52.5],
    });
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(`${url.origin}${url.pathname}`).toBe("https://photon.komoot.io/api");
    expect(url.searchParams.get("q")).toBe("berlin");
    expect(url.searchParams.get("limit")).toBe("5");
    expect(url.searchParams.get("lang")).toBe("en");
    expect(url.searchParams.get("lon")).toBe("13.4");
    expect(url.searchParams.get("lat")).toBe("52.5");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      signal: controller.signal,
    });
  });

  it("omits optional params when unset", async () => {
    const fetchMock = stubFetch({ features: [] });
    await photon.search("berlin", { signal: new AbortController().signal });
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get("limit")).toBeNull();
    expect(url.searchParams.get("lang")).toBeNull();
    expect(url.searchParams.get("lon")).toBeNull();
    expect(url.searchParams.get("lat")).toBeNull();
  });

  it("maps features to GeocodeResult with a reordered bbox", async () => {
    stubFetch(BERLIN_FIXTURE);
    const results = await photon.search("berlin", {
      signal: new AbortController().signal,
    });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: "N:240109189",
      name: "Berlin",
      // state "Berlin" duplicates the name, so only the country remains.
      address: "Germany",
      placeType: "city",
      center: [13.3888599, 52.5170365],
      // extent [minLon, maxLat, maxLon, minLat] -> [west, south, east, north]
      bbox: [13.088345, 52.3382448, 13.7611609, 52.6755087],
    });
    expect(results[0].raw).toBe(BERLIN_FIXTURE.features[0]);
  });

  it("falls back to street + housenumber when name is missing", async () => {
    stubFetch({
      features: [
        {
          geometry: { coordinates: [1, 2] },
          properties: {
            street: "Unter den Linden",
            housenumber: "1",
            city: "Berlin",
            country: "Germany",
          },
        },
      ],
    });
    const [result] = await photon.search("unter", {
      signal: new AbortController().signal,
    });
    expect(result.name).toBe("Unter den Linden 1");
    expect(result.address).toBe("Berlin, Germany");
    expect(result.id).toBe("photon:0");
    expect(result.bbox).toBeUndefined();
  });

  it("throws on non-OK responses", async () => {
    stubFetch({}, false, 503);
    await expect(
      photon.search("x", { signal: new AbortController().signal }),
    ).rejects.toThrow("photon: HTTP 503");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { nominatim } from "./nominatim";

const BERLIN_FIXTURE = [
  {
    place_id: 128369,
    lat: "52.5170365",
    lon: "13.3888599",
    name: "Berlin",
    display_name: "Berlin, Germany",
    category: "boundary",
    type: "administrative",
    boundingbox: ["52.3382448", "52.6755087", "13.088345", "13.7611609"],
  },
];

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

describe("nominatim", () => {
  it("declares public-instance-policy-compliant defaults", () => {
    expect(nominatim.id).toBe("nominatim");
    expect(nominatim.debounceMs).toBe(1100);
    expect(nominatim.minQueryLength).toBe(3);
  });

  it("builds the request URL (jsonv2, accept-language; no proximity param)", async () => {
    const fetchMock = stubFetch([]);
    const controller = new AbortController();
    await nominatim.search("berlin", {
      signal: controller.signal,
      limit: 5,
      language: "de",
      proximity: [13.4, 52.5], // Nominatim has no bias param — must be ignored
    });
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(`${url.origin}${url.pathname}`).toBe(
      "https://nominatim.openstreetmap.org/search",
    );
    expect(url.searchParams.get("q")).toBe("berlin");
    expect(url.searchParams.get("format")).toBe("jsonv2");
    expect(url.searchParams.get("limit")).toBe("5");
    expect(url.searchParams.get("accept-language")).toBe("de");
    expect([...url.searchParams.keys()]).not.toContain("lat");
    expect([...url.searchParams.keys()]).not.toContain("lon");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      signal: controller.signal,
    });
  });

  it("parses string coordinates and reorders the string boundingbox", async () => {
    stubFetch(BERLIN_FIXTURE);
    const [result] = await nominatim.search("berlin", {
      signal: new AbortController().signal,
    });
    expect(result).toMatchObject({
      id: "nominatim:128369",
      name: "Berlin",
      address: "Germany",
      placeType: "administrative",
      center: [13.3888599, 52.5170365],
      // boundingbox [south, north, west, east] -> [west, south, east, north]
      bbox: [13.088345, 52.3382448, 13.7611609, 52.6755087],
    });
    expect(result.raw).toBe(BERLIN_FIXTURE[0]);
  });

  it("derives name from display_name when name is missing", async () => {
    stubFetch([
      {
        place_id: 7,
        lat: "48.8566",
        lon: "2.3522",
        display_name: "Paris, Île-de-France, France",
      },
    ]);
    const [result] = await nominatim.search("paris", {
      signal: new AbortController().signal,
    });
    expect(result.name).toBe("Paris");
    expect(result.address).toBe("Île-de-France, France");
    expect(result.bbox).toBeUndefined();
  });

  it("throws on non-OK responses", async () => {
    stubFetch([], false, 429);
    await expect(
      nominatim.search("x", { signal: new AbortController().signal }),
    ).rejects.toThrow("nominatim: HTTP 429");
  });
});

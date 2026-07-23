import type { GeocodeResult, GeocodingProvider } from "./types";

const ENDPOINT = "https://nominatim.openstreetmap.org/search";

type NominatimItem = {
  place_id?: number;
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  category?: string;
  type?: string;
  /** Nominatim order: [south, north, west, east], all strings. */
  boundingbox?: [string, string, string, string];
};

function toResult(item: NominatimItem, index: number): GeocodeResult {
  const display = item.display_name ?? "";
  const firstComma = display.indexOf(",");
  const displayHead =
    firstComma === -1 ? display : display.slice(0, firstComma);
  const name = item.name || displayHead.trim() || "Unknown place";
  const rest = firstComma === -1 ? "" : display.slice(firstComma + 1).trim();
  const bb = item.boundingbox;
  return {
    id:
      item.place_id != null
        ? `nominatim:${item.place_id}`
        : `nominatim:${index}`,
    name,
    address: rest || undefined,
    placeType: item.type,
    center: [Number.parseFloat(item.lon), Number.parseFloat(item.lat)],
    // Nominatim's boundingbox is [south, north, west, east] as strings;
    // reorder to numeric [west, south, east, north].
    bbox: bb
      ? [
          Number.parseFloat(bb[2]),
          Number.parseFloat(bb[0]),
          Number.parseFloat(bb[3]),
          Number.parseFloat(bb[1]),
        ]
      : undefined,
    raw: item,
  };
}

/**
 * Nominatim (nominatim.openstreetmap.org) — OSM's classic geocoder. The
 * public instance forbids heavy autocomplete (max ~1 req/s), so this provider
 * ships with an 1100 ms debounce; `proximity` is ignored (no bias parameter).
 * Self-host for production traffic.
 */
export const nominatim: GeocodingProvider = {
  id: "nominatim",
  attribution: "Search data © OpenStreetMap contributors",
  minQueryLength: 3,
  debounceMs: 1100,
  async search(query, options) {
    const params = new URLSearchParams({ q: query, format: "jsonv2" });
    if (options.limit != null) params.set("limit", String(options.limit));
    if (options.language) params.set("accept-language", options.language);
    const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
      signal: options.signal,
    });
    if (!response.ok) {
      throw new Error(`nominatim: HTTP ${response.status}`);
    }
    const data = (await response.json()) as NominatimItem[];
    return data.map(toResult);
  },
};

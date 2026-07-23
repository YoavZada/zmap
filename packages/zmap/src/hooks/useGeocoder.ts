import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveGeocoder } from "../providers/geocoding";
import type { GeocodeResult, GeocoderInput } from "../providers/geocoding";
import type { LngLatTuple } from "../utils/geojson";

/** Options for useGeocoder. */
export type UseGeocoderOptions = {
  /** Maximum number of results. Default 5. */
  limit?: number;
  /** Preferred result language, passed through to the provider. */
  language?: string;
  /** Bias center as [lng, lat]; a getter is invoked at request time. */
  proximity?: LngLatTuple | (() => LngLatTuple | undefined);
};

/** State and actions returned by useGeocoder. */
export type UseGeocoderResult = {
  /** The current query text. */
  query: string;
  /** Update the query; a search runs after the provider's debounce. */
  setQuery: (query: string) => void;
  /** Results for the latest completed search. */
  results: GeocodeResult[];
  /** True while a request is in flight. */
  loading: boolean;
  /** The last non-abort error; cleared by the next successful search. */
  error: Error | null;
  /** Abort in-flight work and reset query, results, and error. */
  clear: () => void;
};

const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 5;

/**
 * Headless place search: debounced, abortable, stale-safe. GeocoderControl
 * is a thin MUI surface over this hook; use it directly for custom UIs.
 */
export function useGeocoder(
  provider: GeocoderInput = "photon",
  options: UseGeocoderOptions = {},
): UseGeocoderResult {
  const { limit = DEFAULT_LIMIT, language, proximity } = options;
  const resolved = useMemo(() => resolveGeocoder(provider), [provider]);

  const [query, setQueryState] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  // Read at request time so getters (e.g. live map center) stay fresh.
  const proximityRef = useRef(proximity);
  proximityRef.current = proximity;

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const setQuery = useCallback(
    (next: string) => {
      setQueryState(next);
      cancel();
      const trimmed = next.trim();
      if (
        trimmed.length < (resolved.minQueryLength ?? DEFAULT_MIN_QUERY_LENGTH)
      ) {
        setResults([]);
        setLoading(false);
        return;
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const controller = new AbortController();
        controllerRef.current = controller;
        setLoading(true);
        const prox = proximityRef.current;
        const proximityValue = typeof prox === "function" ? prox() : prox;
        resolved
          .search(trimmed, {
            signal: controller.signal,
            limit,
            language,
            proximity: proximityValue,
          })
          .then((found) => {
            if (controller.signal.aborted) return;
            setResults(found);
            setError(null);
            setLoading(false);
          })
          .catch((cause: unknown) => {
            if (controller.signal.aborted) return;
            setError(cause instanceof Error ? cause : new Error(String(cause)));
            setResults([]);
            setLoading(false);
          });
      }, resolved.debounceMs ?? DEFAULT_DEBOUNCE_MS);
    },
    [cancel, language, limit, resolved],
  );

  const clear = useCallback(() => {
    cancel();
    setQueryState("");
    setResults([]);
    setError(null);
    setLoading(false);
  }, [cancel]);

  // Abort any pending work on unmount.
  useEffect(() => cancel, [cancel]);

  return { query, setQuery, results, loading, error, clear };
}

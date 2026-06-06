import { useCallback, useEffect, useRef, useState } from "react";
import type { LngLatTuple } from "zmapgl";
import { fetchRoute, RoutingError } from "../lib/osrm";
import type { RouteOrder, RoutePoint, RouteResult } from "../lib/types";

/** idle (0–1 points) → routing (request in flight) → done | error. */
export type Phase = "idle" | "routing" | "done" | "error";

const DRAW_MS = 650;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export type Pathfinder = {
  points: RoutePoint[];
  result: RouteResult | null;
  phase: Phase;
  error: string | null;
  /** Whether the engine reorders the points or keeps the dropped order. */
  order: RouteOrder;
  /** How many route coordinates are currently revealed (draw-on animation). */
  pathVisible: number;
  addPoint: (lngLat: LngLatTuple) => void;
  movePoint: (id: number, lngLat: LngLatTuple) => void;
  removePoint: (id: number) => void;
  removeLast: () => void;
  /** Move a point one slot earlier (-1) or later (+1) in the visiting list. */
  reorderPoint: (id: number, direction: -1 | 1) => void;
  /** Set a point's display name ("" clears it back to the number). */
  renamePoint: (id: number, name: string) => void;
  changeOrder: (order: RouteOrder) => void;
  clear: () => void;
};

/**
 * Owns the dropped points and the route between them. Any change to the set of
 * points re-queries the routing engine (cancelling an in-flight request), then
 * the resulting street-following polyline is drawn on with a short animation.
 */
export function usePathfinder(): Pathfinder {
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<RouteOrder>("optimized");
  const [pathVisible, setPathVisible] = useState(0);

  const nextId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // A signature of just the routable inputs (coordinates in order). Renaming a
  // point changes `points` but not this key, so it won't trigger a re-route.
  const coordsKey = points.map((p) => `${p.lng},${p.lat}`).join("|");

  // Recompute whenever the coordinates or their order change. Fewer than two
  // points can't form a route, so we just clear. The previous result is kept on
  // screen while a new request is in flight to avoid a flicker.
  useEffect(() => {
    abortRef.current?.abort();

    if (points.length < 2) {
      setResult(null);
      setPhase("idle");
      setError(null);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setPhase("routing");
    setError(null);

    const coords = points.map((p) => [p.lng, p.lat] as LngLatTuple);
    fetchRoute(coords, order, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return;
        setResult(res);
        setPathVisible(0);
        setPhase("done");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || (err as Error).name === "AbortError") {
          return;
        }
        setResult(null);
        setPhase("error");
        setError(
          err instanceof RoutingError
            ? err.message
            : "Something went wrong while routing.",
        );
      });

    return () => controller.abort();
    // `points` is read inside but intentionally excluded — we key off the
    // coordinate signature so renames don't recompute the route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordsKey, order]);

  // Draw the route on once a fresh result lands.
  useEffect(() => {
    if (phase !== "done" || !result) return;
    stopAnimation();

    const total = result.coordinates.length;
    let startTs: number | null = null;
    const tick = (ts: number) => {
      if (startTs === null) startTs = ts;
      const p = easeOutCubic(Math.min(1, (ts - startTs) / DRAW_MS));
      setPathVisible(Math.max(2, Math.round(p * total)));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => stopAnimation();
  }, [phase, result, stopAnimation]);

  const addPoint = useCallback((lngLat: LngLatTuple) => {
    setPoints((prev) => [
      ...prev,
      { id: nextId.current++, lng: lngLat[0], lat: lngLat[1] },
    ]);
  }, []);

  const movePoint = useCallback((id: number, lngLat: LngLatTuple) => {
    setPoints((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, lng: lngLat[0], lat: lngLat[1] } : p,
      ),
    );
  }, []);

  const removePoint = useCallback((id: number) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const removeLast = useCallback(() => {
    setPoints((prev) => prev.slice(0, -1));
  }, []);

  const reorderPoint = useCallback((id: number, direction: -1 | 1) => {
    setPoints((prev) => {
      const i = prev.findIndex((p) => p.id === id);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    // Reordering only matters when the order is honored, so adopt it.
    setOrder("fixed");
  }, []);

  const renamePoint = useCallback((id: number, name: string) => {
    const trimmed = name.trimStart();
    setPoints((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name: trimmed === "" ? undefined : name } : p,
      ),
    );
  }, []);

  const changeOrder = useCallback((next: RouteOrder) => {
    setOrder(next);
  }, []);

  const clear = useCallback(() => {
    setPoints([]);
  }, []);

  return {
    points,
    result,
    phase,
    error,
    order,
    pathVisible,
    addPoint,
    movePoint,
    removePoint,
    removeLast,
    reorderPoint,
    renamePoint,
    changeOrder,
    clear,
  };
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { LngLatTuple } from "zmap";
import { dijkstra } from "../lib/dijkstra";
import { nearestNode } from "../lib/geo";
import type { Metric, PathResult, RoadNetwork } from "../lib/types";

/** idle → animating (search + draw) → done | no-path. */
export type Phase = "idle" | "animating" | "done" | "no-path";

const EXPLORE_MS = 1400;
const DRAW_MS = 700;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export type Pathfinder = {
  start: number | null;
  end: number | null;
  metric: Metric;
  phase: Phase;
  result: PathResult | null;
  /** How many settled nodes are currently revealed (search animation). */
  exploredVisible: number;
  /** How many path coordinates are currently revealed (draw animation). */
  pathVisible: number;
  canRun: boolean;
  pickPoint: (lngLat: LngLatTuple) => void;
  dragEndpoint: (which: "start" | "end", lngLat: LngLatTuple) => void;
  changeMetric: (metric: Metric) => void;
  run: () => void;
  reset: () => void;
};

export function usePathfinder(network: RoadNetwork): Pathfinder {
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const [metric, setMetric] = useState<Metric>("distance");
  const [result, setResult] = useState<PathResult | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [exploredVisible, setExploredVisible] = useState(0);
  const [pathVisible, setPathVisible] = useState(0);

  const rafRef = useRef<number | null>(null);

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const clearResult = useCallback(() => {
    stopAnimation();
    setResult(null);
    setPhase("idle");
    setExploredVisible(0);
    setPathVisible(0);
  }, [stopAnimation]);

  const runWith = useCallback(
    (from: number, to: number, m: Metric) => {
      stopAnimation();
      const res = dijkstra(network, from, to, m);
      setResult(res);
      setExploredVisible(0);
      setPathVisible(0);
      setPhase("animating");
    },
    [network, stopAnimation],
  );

  // Drive the search + draw animation whenever a fresh result starts animating.
  useEffect(() => {
    if (phase !== "animating" || !result) return;

    const settledTotal = result.settled.length;
    const pathTotal = result.coordinates.length;
    let startTs: number | null = null;

    const tick = (ts: number) => {
      if (startTs === null) startTs = ts;
      const elapsed = ts - startTs;

      if (elapsed < EXPLORE_MS) {
        const p = easeOutCubic(elapsed / EXPLORE_MS);
        setExploredVisible(Math.round(p * settledTotal));
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      setExploredVisible(settledTotal);

      if (!result.found) {
        setPhase("no-path");
        rafRef.current = null;
        return;
      }

      const drawElapsed = elapsed - EXPLORE_MS;
      if (drawElapsed < DRAW_MS) {
        const p = drawElapsed / DRAW_MS;
        setPathVisible(Math.max(2, Math.round(p * pathTotal)));
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      setPathVisible(pathTotal);
      setPhase("done");
      rafRef.current = null;
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopAnimation();
  }, [phase, result, stopAnimation]);

  const pickPoint = useCallback(
    (lngLat: LngLatTuple) => {
      const node = nearestNode(network, lngLat).id;
      if (start === null) {
        setStart(node);
        clearResult();
      } else if (end === null && node !== start) {
        setEnd(node);
        clearResult();
      } else {
        // Both set (or re-clicked the start) — begin a fresh selection.
        setStart(node);
        setEnd(null);
        clearResult();
      }
    },
    [network, start, end, clearResult],
  );

  const dragEndpoint = useCallback(
    (which: "start" | "end", lngLat: LngLatTuple) => {
      const node = nearestNode(network, lngLat).id;
      const nextStart = which === "start" ? node : start;
      const nextEnd = which === "end" ? node : end;
      if (which === "start") setStart(node);
      else setEnd(node);
      if (nextStart !== null && nextEnd !== null && nextStart !== nextEnd) {
        runWith(nextStart, nextEnd, metric);
      } else {
        clearResult();
      }
    },
    [network, start, end, metric, runWith, clearResult],
  );

  const changeMetric = useCallback(
    (m: Metric) => {
      setMetric(m);
      if (start !== null && end !== null && start !== end) {
        runWith(start, end, m);
      }
    },
    [start, end, runWith],
  );

  const run = useCallback(() => {
    if (start !== null && end !== null && start !== end) {
      runWith(start, end, metric);
    }
  }, [start, end, metric, runWith]);

  const reset = useCallback(() => {
    setStart(null);
    setEnd(null);
    clearResult();
  }, [clearResult]);

  const canRun = start !== null && end !== null && start !== end;

  return {
    start,
    end,
    metric,
    phase,
    result,
    exploredVisible,
    pathVisible,
    canRun,
    pickPoint,
    dragEndpoint,
    changeMetric,
    run,
    reset,
  };
}

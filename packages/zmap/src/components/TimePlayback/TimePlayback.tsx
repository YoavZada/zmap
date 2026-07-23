import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react";
import { useTheme } from "@mui/material/styles";
import type { FilterSpecification } from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import { useMapContext } from "../../context/useMap";
import { useMapLayer, type LayerInput } from "../../hooks/useMapLayer";
import { resolvePaletteColor } from "../../utils/color";
import {
  applyLayerOverrides,
  type LayerOverride,
} from "../../utils/layerOverrides";
import type { ControlPosition } from "../MapControls";
import TransportBar from "./components/TransportBar";

const SPEEDS = [0.5, 1, 2, 4];

/** Props for `<TimePlayback>`, which animates time-stamped GeoJSON points along a playhead. */
export type TimePlaybackProps = {
  /** Unique source/layer id. Auto-generated when omitted. */
  id?: string;
  /** GeoJSON points, each carrying a numeric timestamp property. */
  data: FeatureCollection;
  /** Name of the numeric timestamp property. Default "time". */
  timeProperty?: string;
  /**
   * Visible trailing window, in the same units as the timestamps: only points
   * with `playhead - trail ≤ t ≤ playhead` show. Omit for a cumulative trail —
   * everything up to the playhead stays on screen.
   */
  trail?: number;
  /** Head (most-recent) point color — palette token or CSS. Default "primary.main". */
  color?: string;
  /** Trail point color. Defaults to `color`. */
  trailColor?: string;
  /** Head point radius in px. Default 6. */
  radius?: number;
  /** Seconds for one full playthrough at 1×. Default 12. */
  duration?: number;
  /** Loop back to the start at the end. Default true. */
  loop?: boolean;
  /** Start playing on mount (uncontrolled initial). Default false. */
  autoplay?: boolean;
  /**
   * Controlled playhead value. Pair with `onTimeChange` to own playback state;
   * omit to let the component manage it internally.
   */
  playhead?: number;
  /** Initial playhead for uncontrolled use. Defaults to the data's min time. */
  defaultPlayhead?: number;
  /** Controlled playing state. Pair with `onPlayingChange`. */
  playing?: boolean;
  /** Fired when the transport wants to start or stop (toggle, end reached). */
  onPlayingChange?: (playing: boolean) => void;
  /** Render the transport bar. Default true. */
  showTransport?: boolean;
  /** Corner to anchor the transport bar. Default "bottom-left". */
  position?: ControlPosition;
  /** Format the playhead value shown on the transport bar. */
  formatTime?: (value: number) => string;
  /** Called whenever the playhead advances or is scrubbed. */
  onTimeChange?: (value: number) => void;
  /** Insert the layers before this existing layer id. */
  beforeId?: string;
  /** Paint/layout patches merged into the generated trail/head layers. */
  layerOverrides?: { trail?: LayerOverride; head?: LayerOverride };
};

/**
 * Animates time-stamped GeoJSON points along a playhead — great for trips and
 * trajectories. Renders a faint cumulative (or trailing) trail plus a bright
 * "head" of the most-recent points, driven by a themed MUI transport bar
 * (play/pause, scrubber, speed). Filtering happens on the GPU, so it stays
 * smooth with many points. Playhead and playing state follow the standard
 * controlled/uncontrolled pattern.
 */
const TimePlayback: FC<TimePlaybackProps> = ({
  id,
  data,
  timeProperty = "time",
  trail,
  color = "primary.main",
  trailColor,
  radius = 6,
  duration = 12,
  loop = true,
  autoplay = false,
  playhead: playheadProp,
  defaultPlayhead,
  playing: playingProp,
  onPlayingChange,
  showTransport = true,
  position = "bottom-left",
  formatTime,
  onTimeChange,
  beforeId,
  layerOverrides,
}) => {
  const theme = useTheme();
  const { map } = useMapContext();
  const reactId = useId();
  const baseId = id ?? `zmap-time-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const trailId = `${baseId}-trail`;
  const headId = `${baseId}-head`;

  // Time bounds derived from the data.
  const bounds = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const f of data.features) {
      const t = f.properties?.[timeProperty];
      if (typeof t === "number") {
        if (t < min) min = t;
        if (t > max) max = t;
      }
    }
    if (!Number.isFinite(min)) return { min: 0, max: 1 };
    return { min, max: max > min ? max : min + 1 };
  }, [data, timeProperty]);

  // Controlled/uncontrolled playhead + playing. Internal writes go through
  // commit*() so controlled parents are notified without local state churn.
  const isPlayheadControlled = playheadProp !== undefined;
  const [internalPlayhead, setInternalPlayhead] = useState(
    defaultPlayhead ?? bounds.min,
  );
  const playhead = playheadProp ?? internalPlayhead;

  const isPlayingControlled = playingProp !== undefined;
  const [internalPlaying, setInternalPlaying] = useState(autoplay);
  const playing = playingProp ?? internalPlaying;

  const [speedIndex, setSpeedIndex] = useState(1);
  const speed = SPEEDS[speedIndex];

  const onTimeChangeRef = useRef(onTimeChange);
  onTimeChangeRef.current = onTimeChange;
  const onPlayingChangeRef = useRef(onPlayingChange);
  onPlayingChangeRef.current = onPlayingChange;

  // The RAF loop reads the latest playhead from a ref so a controlled parent's
  // batched updates never make it skip.
  const playheadRef = useRef(playhead);
  playheadRef.current = playhead;

  const commitPlayhead = useCallback(
    (next: number) => {
      playheadRef.current = next;
      onTimeChangeRef.current?.(next);
      if (!isPlayheadControlled) setInternalPlayhead(next);
    },
    [isPlayheadControlled],
  );

  const commitPlaying = useCallback(
    (next: boolean) => {
      onPlayingChangeRef.current?.(next);
      if (!isPlayingControlled) setInternalPlaying(next);
    },
    [isPlayingControlled],
  );

  // Keep an uncontrolled playhead within bounds when the data changes.
  useEffect(() => {
    if (isPlayheadControlled) return;
    setInternalPlayhead((p) => Math.min(Math.max(p, bounds.min), bounds.max));
  }, [isPlayheadControlled, bounds.min, bounds.max]);

  const resolvedColor = resolvePaletteColor(theme, color);
  const resolvedTrail = resolvePaletteColor(theme, trailColor ?? color);
  const resolvedStroke = resolvePaletteColor(theme, "background.paper");

  const layers = useMemo<LayerInput[]>(
    () =>
      applyLayerOverrides(
        [
          {
            id: trailId,
            type: "circle",
            paint: {
              "circle-radius": Math.max(2, radius * 0.5),
              "circle-color": resolvedTrail,
              "circle-opacity": 0.3,
            },
          },
          {
            id: headId,
            type: "circle",
            paint: {
              "circle-radius": radius,
              "circle-color": resolvedColor,
              "circle-opacity": 0.95,
              "circle-stroke-color": resolvedStroke,
              "circle-stroke-width": 1.5,
            },
          },
        ],
        layerOverrides,
      ),
    [
      trailId,
      headId,
      radius,
      resolvedColor,
      resolvedTrail,
      resolvedStroke,
      layerOverrides,
    ],
  );

  useMapLayer({ id: baseId, data, layers, beforeId });

  // The latest filters, applied imperatively so per-frame playhead changes never
  // re-create the layers (which would churn the source).
  const filtersRef = useRef<{
    trail: FilterSpecification;
    head: FilterSpecification;
  } | null>(null);

  const applyFilters = useCallback(() => {
    if (!map || !filtersRef.current) return;
    try {
      if (map.getLayer(trailId))
        map.setFilter(trailId, filtersRef.current.trail);
      if (map.getLayer(headId)) map.setFilter(headId, filtersRef.current.head);
    } catch {
      // Layer/style torn down mid-update — nothing to filter.
    }
  }, [map, trailId, headId]);

  useEffect(() => {
    const span = bounds.max - bounds.min;
    const headWindow = trail != null ? trail * 0.25 : span * 0.04;
    const head = [
      "all",
      ["<=", ["get", timeProperty], playhead],
      [">=", ["get", timeProperty], playhead - headWindow],
    ] as FilterSpecification;
    const trailFilter = (
      trail != null
        ? [
            "all",
            ["<=", ["get", timeProperty], playhead],
            [">=", ["get", timeProperty], playhead - trail],
          ]
        : ["<=", ["get", timeProperty], playhead]
    ) as FilterSpecification;
    filtersRef.current = { trail: trailFilter, head };
    applyFilters();
  }, [playhead, trail, timeProperty, bounds.min, bounds.max, applyFilters]);

  // MapLibre re-adds the layers (filterless) after a theme-driven style swap;
  // re-apply the current filters once they're back.
  useEffect(() => {
    if (!map) return;
    const reapply = () => applyFilters();
    map.on("styledata", reapply);
    return () => {
      map.off("styledata", reapply);
    };
  }, [map, applyFilters]);

  // The animation loop. Advance the playhead by wall-clock elapsed × speed.
  useEffect(() => {
    if (!playing) return;
    const span = bounds.max - bounds.min;
    let raf = 0;
    let last: number | null = null;
    const step = (ts: number) => {
      if (last == null) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      let next = playheadRef.current + (dt / duration) * span * speed;
      if (next >= bounds.max) next = loop ? bounds.min : bounds.max;
      commitPlayhead(next);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, bounds.min, bounds.max, duration, speed, loop, commitPlayhead]);

  // Stop at the end when not looping.
  const atEnd = playhead >= bounds.max;
  useEffect(() => {
    if (playing && !loop && atEnd) commitPlaying(false);
  }, [playing, loop, atEnd, commitPlaying]);

  const toggle = useCallback(() => {
    if (!playing && playheadRef.current >= bounds.max) {
      // Restart from the top when play is hit at the end.
      commitPlayhead(bounds.min);
      commitPlaying(true);
      return;
    }
    commitPlaying(!playing);
  }, [playing, bounds.min, bounds.max, commitPlayhead, commitPlaying]);

  const cycleSpeed = useCallback(
    () => setSpeedIndex((i) => (i + 1) % SPEEDS.length),
    [],
  );

  const format = formatTime ?? ((v: number) => String(Math.round(v)));

  if (!showTransport) return null;

  return (
    <TransportBar
      position={position}
      playing={playing}
      atEnd={atEnd}
      playhead={playhead}
      min={bounds.min}
      max={bounds.max}
      speed={speed}
      format={format}
      onToggle={toggle}
      onScrub={commitPlayhead}
      onCycleSpeed={cycleSpeed}
    />
  );
};

export default TimePlayback;

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
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Pause from "@mui/icons-material/Pause";
import Replay from "@mui/icons-material/Replay";
import { useMapContext } from "../context/useMap";
import { useMapLayer, type LayerInput } from "../hooks/useMapLayer";
import { resolvePaletteColor } from "../utils/color";
import type { ControlPosition } from "./MapControls";
import Styles from "./timePlayback.style";

const SPEEDS = [0.5, 1, 2, 4];

export type TimePlaybackProps = {
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
  /** Start playing on mount. Default false. */
  autoplay?: boolean;
  /** Render the transport bar. Default true. */
  showTransport?: boolean;
  /** Corner to anchor the transport bar. Default "bottom-left". */
  position?: ControlPosition;
  /** Format the playhead value shown on the transport bar. */
  formatTime?: (value: number) => string;
  /** Called whenever the playhead advances or is scrubbed. */
  onTimeChange?: (value: number) => void;
};

/**
 * Animates time-stamped GeoJSON points along a playhead — great for trips and
 * trajectories. Renders a faint cumulative (or trailing) trail plus a bright
 * "head" of the most-recent points, driven by a themed MUI transport bar
 * (play/pause, scrubber, speed). Filtering happens on the GPU, so it stays
 * smooth with many points.
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
  showTransport = true,
  position = "bottom-left",
  formatTime,
  onTimeChange,
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

  const [playhead, setPlayhead] = useState(bounds.min);
  const [playing, setPlaying] = useState(autoplay);
  const [speedIndex, setSpeedIndex] = useState(1);
  const speed = SPEEDS[speedIndex];

  // Keep the playhead within bounds when the data (and so bounds) changes.
  useEffect(() => {
    setPlayhead((p) => Math.min(Math.max(p, bounds.min), bounds.max));
  }, [bounds.min, bounds.max]);

  // Report playhead changes without re-subscribing on every advance.
  const onTimeChangeRef = useRef(onTimeChange);
  onTimeChangeRef.current = onTimeChange;
  useEffect(() => {
    onTimeChangeRef.current?.(playhead);
  }, [playhead]);

  const resolvedColor = resolvePaletteColor(theme, color);
  const resolvedTrail = resolvePaletteColor(theme, trailColor ?? color);
  const resolvedStroke = resolvePaletteColor(theme, "background.paper");

  const layers = useMemo<LayerInput[]>(
    () => [
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
    [trailId, headId, radius, resolvedColor, resolvedTrail, resolvedStroke],
  );

  useMapLayer({ id: baseId, data, layers });

  // The latest filters, applied imperatively so per-frame playhead changes never
  // re-create the layers (which would churn the source).
  const filtersRef = useRef<{
    trail: FilterSpecification;
    head: FilterSpecification;
  } | null>(null);

  const applyFilters = useCallback(() => {
    if (!map || !filtersRef.current) return;
    try {
      if (map.getLayer(trailId)) map.setFilter(trailId, filtersRef.current.trail);
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
      setPlayhead((prev) => {
        let next = prev + (dt / duration) * span * speed;
        if (next >= bounds.max) next = loop ? bounds.min : bounds.max;
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, bounds.min, bounds.max, duration, speed, loop]);

  // Stop at the end when not looping.
  const atEnd = playhead >= bounds.max;
  useEffect(() => {
    if (playing && !loop && atEnd) setPlaying(false);
  }, [playing, loop, atEnd]);

  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p && playhead >= bounds.max) {
        setPlayhead(bounds.min);
        return true;
      }
      return !p;
    });
  }, [playhead, bounds.min, bounds.max]);

  const cycleSpeed = useCallback(
    () => setSpeedIndex((i) => (i + 1) % SPEEDS.length),
    [],
  );

  const format = formatTime ?? ((v: number) => String(Math.round(v)));

  if (!showTransport) return null;

  return (
    <Paper elevation={3} sx={Styles.transport(position)}>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Tooltip title={playing ? "Pause" : "Play"} placement="top">
          <IconButton
            size="small"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
          >
            {atEnd && !playing ? (
              <Replay fontSize="small" />
            ) : playing ? (
              <Pause fontSize="small" />
            ) : (
              <PlayArrow fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        <Slider
          size="small"
          min={bounds.min}
          max={bounds.max}
          value={playhead}
          onChange={(_, v) => setPlayhead(v as number)}
          aria-label="Playhead"
          sx={Styles.slider}
        />

        <Typography variant="caption" sx={Styles.time}>
          {format(playhead)}
        </Typography>

        <Tooltip title="Playback speed" placement="top">
          <Button
            size="small"
            color="inherit"
            onClick={cycleSpeed}
            sx={Styles.speed}
          >
            {speed}×
          </Button>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

export default TimePlayback;

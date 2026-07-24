import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type FC,
} from "react";
import { useTheme } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import HighlightAltOutlined from "@mui/icons-material/HighlightAltOutlined";
import GestureOutlined from "@mui/icons-material/GestureOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import type { MapMouseEvent } from "maplibre-gl";
import { useMapContext } from "../../context/useMap";
import { resolvePaletteColor } from "../../utils/color";
import type { LngLatTuple } from "../../utils/geojson";
import {
  pointInBox,
  pointInPolygon,
  type ScreenPoint,
} from "../../utils/geometry";
import KeyboardCrosshair from "../KeyboardCrosshair";
import type { ControlPosition } from "../MapControls";
import PointLayer, { type LayerPoint } from "../PointLayer";
import Styles from "./selectControl.style";

/** Which selection tool is active: a marquee box or a freehand lasso. */
export type SelectTool = "box" | "lasso";

/** Props for `<SelectControl>`, marquee/lasso selection over `<PointLayer>` features. */
export type SelectControlProps = {
  /** The same points fed to your <PointLayer>. Selection runs against these. */
  points: LayerPoint[];
  /** Corner for the tool palette. Default "top-left". */
  position?: ControlPosition;
  /** Tools to offer. Default box + lasso. */
  tools?: SelectTool[];
  /** Show the toolbar. When false, `defaultTool` (or the first tool) stays armed. */
  showToolbar?: boolean;
  /** Tool armed on mount. Default none (with a toolbar) / the first tool (without). */
  defaultTool?: SelectTool | null;
  /** Fired on every completed selection with the hit points and their indices. */
  onSelect?: (selected: LayerPoint[], indices: number[]) => void;
  /** Palette token or CSS color for the marquee / lasso. Default "primary.main". */
  selectionColor?: string;
  /** Highlight the selected points. Default true. */
  highlight?: boolean;
  /** Palette token or CSS color for the highlight. Default "secondary.main". */
  highlightColor?: string;
};

const TOOL_META: Record<SelectTool, { icon: ElementType; label: string }> = {
  box: { icon: HighlightAltOutlined, label: "Box select" },
  lasso: { icon: GestureOutlined, label: "Lasso select" },
};

/**
 * Drag a marquee box or freehand lasso to select <PointLayer> features. While a
 * tool is armed, panning is suspended so the drag draws a selection; release to
 * select. Selected points are highlighted and reported via onSelect.
 */
const SelectControl: FC<SelectControlProps> = ({
  points,
  position = "top-left",
  tools = ["box", "lasso"],
  showToolbar = true,
  defaultTool = null,
  onSelect,
  selectionColor = "primary.main",
  highlight = true,
  highlightColor = "secondary.main",
}) => {
  const { map } = useMapContext();
  const theme = useTheme();
  const reactId = useId();
  const idPrefix = `zmap-select-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const [tool, setTool] = useState<SelectTool | null>(
    showToolbar ? defaultTool : (defaultTool ?? tools[0] ?? "box"),
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [box, setBox] = useState<{
    start: ScreenPoint;
    current: ScreenPoint;
  } | null>(null);
  const [lasso, setLasso] = useState<ScreenPoint[]>([]);

  // Refs so the (once-bound) map handlers always read current values.
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!map || !tool) return;

    map.dragPan.disable();
    map.boxZoom.disable();
    const canvas = map.getCanvas();
    const prevCursor = canvas.style.cursor;
    canvas.style.cursor = "crosshair";

    let dragging = false;
    let start: ScreenPoint | null = null;
    let current: ScreenPoint | null = null;
    let path: ScreenPoint[] = [];

    const apply = (predicate: (pt: ScreenPoint) => boolean) => {
      const indices: number[] = [];
      pointsRef.current.forEach((p, i) => {
        const pt = map.project([p.longitude, p.latitude]);
        if (predicate({ x: pt.x, y: pt.y })) indices.push(i);
      });
      setSelected(indices);
      onSelectRef.current?.(
        indices.map((i) => pointsRef.current[i]),
        indices,
      );
    };

    const finalize = (end: ScreenPoint) => {
      if (toolRef.current === "box" && start) {
        apply((pt) => pointInBox(pt, start as ScreenPoint, end));
        setBox(null);
      } else if (toolRef.current === "lasso") {
        const ring = [...path, end];
        if (ring.length >= 3) apply((pt) => pointInPolygon(pt, ring));
        setLasso([]);
      }
      dragging = false;
      start = null;
      current = null;
      path = [];
    };

    const onDown = (e: MapMouseEvent) => {
      dragging = true;
      const p = { x: e.point.x, y: e.point.y };
      start = p;
      current = p;
      path = [p];
      if (toolRef.current === "box") setBox({ start: p, current: p });
      else setLasso([p]);
    };

    const onMove = (e: MapMouseEvent) => {
      if (!dragging) return;
      const p = { x: e.point.x, y: e.point.y };
      current = p;
      if (toolRef.current === "box") {
        if (start) setBox({ start, current: p });
      } else {
        const last = path[path.length - 1];
        if (!last || Math.hypot(p.x - last.x, p.y - last.y) >= 4) {
          path = [...path, p];
          setLasso(path);
        }
      }
    };

    const onUp = (e: MapMouseEvent) => {
      if (!dragging) return;
      finalize({ x: e.point.x, y: e.point.y });
    };

    // Fallback when the mouse is released outside the canvas.
    const onWindowUp = () => {
      if (dragging && current) finalize(current);
    };

    map.on("mousedown", onDown);
    map.on("mousemove", onMove);
    map.on("mouseup", onUp);
    window.addEventListener("mouseup", onWindowUp);

    return () => {
      map.dragPan.enable();
      map.boxZoom.enable();
      canvas.style.cursor = prevCursor;
      map.off("mousedown", onDown);
      map.off("mousemove", onMove);
      map.off("mouseup", onUp);
      window.removeEventListener("mouseup", onWindowUp);
      setBox(null);
      setLasso([]);
    };
  }, [map, tool]);

  // Keyboard box selection: Space marks corner 1 at center, next Space marks
  // corner 2 and selects. Box-only (lasso stays pointer-only).
  const kbCornerRef = useRef<LngLatTuple | null>(null);
  const [kbCornerPending, setKbCornerPending] = useState(false);
  useEffect(() => {
    if (!map || tool !== "box") return;
    const canvas = map.getCanvas();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== " " && e.code !== "Space") return;
      e.preventDefault();
      const c = map.getCenter();
      const here: LngLatTuple = [c.lng, c.lat];
      if (!kbCornerRef.current) {
        kbCornerRef.current = here;
        setKbCornerPending(true);
        return;
      }
      const a = map.project(kbCornerRef.current);
      const b = map.project(here);
      const start: ScreenPoint = { x: a.x, y: a.y };
      const end: ScreenPoint = { x: b.x, y: b.y };
      const indices: number[] = [];
      pointsRef.current.forEach((p, i) => {
        const pt = map.project([p.longitude, p.latitude]);
        if (pointInBox({ x: pt.x, y: pt.y }, start, end)) indices.push(i);
      });
      setSelected(indices);
      onSelectRef.current?.(
        indices.map((i) => pointsRef.current[i]),
        indices,
      );
      kbCornerRef.current = null;
      setKbCornerPending(false);
    };
    const onKeyEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        kbCornerRef.current = null;
        setKbCornerPending(false);
      }
    };
    canvas.addEventListener("keydown", onKey);
    canvas.addEventListener("keydown", onKeyEsc);
    return () => {
      canvas.removeEventListener("keydown", onKey);
      canvas.removeEventListener("keydown", onKeyEsc);
      kbCornerRef.current = null;
      setKbCornerPending(false);
    };
  }, [map, tool]);

  const stroke = resolvePaletteColor(theme, selectionColor);

  const selectedPoints = useMemo(
    () => selected.map((i) => points[i]).filter(Boolean),
    [selected, points],
  );

  const clearSelection = () => {
    setSelected([]);
    onSelect?.([], []);
  };

  return (
    <>
      {showToolbar && (
        <Paper elevation={3} sx={Styles.panel(position)}>
          <Stack direction="column" divider={<Divider flexItem />}>
            <Stack direction="column" divider={<Divider flexItem />}>
              {tools.map((t) => {
                const { icon: Icon, label } = TOOL_META[t];
                const active = tool === t;
                return (
                  <Tooltip key={t} title={label} placement="right">
                    <IconButton
                      size="small"
                      onClick={() => setTool(active ? null : t)}
                      sx={Styles.toolButton(active)}
                      aria-label={label}
                      aria-pressed={active}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                );
              })}
            </Stack>

            {selected.length > 0 && (
              <Tooltip title="Clear selection" placement="right">
                <IconButton
                  size="small"
                  onClick={clearSelection}
                  aria-label="Clear selection"
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Paper>
      )}

      {(box || lasso.length > 0) && (
        <Box sx={Styles.overlay}>
          <Box component="svg" sx={Styles.svg}>
            {box && (
              <rect
                x={Math.min(box.start.x, box.current.x)}
                y={Math.min(box.start.y, box.current.y)}
                width={Math.abs(box.current.x - box.start.x)}
                height={Math.abs(box.current.y - box.start.y)}
                fill={stroke}
                fillOpacity={0.12}
                stroke={stroke}
                strokeWidth={1.5}
              />
            )}
            {lasso.length > 1 && (
              <polygon
                points={lasso.map((p) => `${p.x},${p.y}`).join(" ")}
                fill={stroke}
                fillOpacity={0.12}
                stroke={stroke}
                strokeWidth={1.5}
              />
            )}
          </Box>
        </Box>
      )}

      {highlight && selectedPoints.length > 0 && (
        <PointLayer
          id={`${idPrefix}-highlight`}
          points={selectedPoints}
          fillColor={highlightColor}
          radius={9}
          strokeColor="background.paper"
          strokeWidth={2}
        />
      )}

      {tool === "box" && <KeyboardCrosshair />}
      {kbCornerPending && (
        <Box sx={Styles.kbHint} aria-live="polite">
          Space: set the second corner
        </Box>
      )}
    </>
  );
};

export default SelectControl;

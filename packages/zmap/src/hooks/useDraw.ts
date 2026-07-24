import { useCallback, useEffect, useRef, useState } from "react";
import type { Feature, LineString, Point, Polygon } from "geojson";
import type { MapMouseEvent } from "maplibre-gl";
import { useMapContext } from "../context/useMap";
import type { LngLatTuple } from "../utils/geojson";

/** Which drawing tool is active: point, line, or polygon. */
export type DrawMode = "point" | "line" | "polygon";

/** Properties `useDraw` attaches to every completed `DrawFeature`. */
export interface DrawFeatureProperties {
  /** Stable id for the drawn feature. */
  id: string;
  /** Which tool produced it. */
  mode: DrawMode;
}

/** A completed shape produced by `useDraw` — plain GeoJSON with `DrawFeatureProperties`. */
export type DrawFeature = Feature<
  Point | LineString | Polygon,
  DrawFeatureProperties
>;

/** Options for `useDraw`. */
export interface UseDrawOptions {
  /** Tools the engine accepts. Default all three. */
  modes?: DrawMode[];
  /** Fired with the full feature list on every add/remove/clear. */
  onChange?: (features: DrawFeature[]) => void;
  /** Fired once when a single feature is completed. */
  onCreate?: (feature: DrawFeature) => void;
}

/** The state and actions returned by `useDraw`. */
export interface DrawEngine {
  /** Active tool, or null when idle. */
  mode: DrawMode | null;
  /** Arm a tool (or null to disarm). Discards any in-progress draft. */
  setMode: (mode: DrawMode | null) => void;
  /** Completed features. */
  features: DrawFeature[];
  /** Vertices of the shape currently being drawn. */
  draft: LngLatTuple[];
  /** Live pointer position, for the rubber-band preview (null when idle). */
  cursor: LngLatTuple | null;
  /** True while a multi-vertex shape (line/polygon) is mid-draw. */
  isDrawing: boolean;
  /** Commit the current draft (also bound to double-click / Enter). */
  finish: () => void;
  /** Drop the last draft vertex, or the last feature when the draft is empty. */
  undo: () => void;
  /** Remove a single completed feature by id. */
  remove: (id: string) => void;
  /** Discard the draft and all completed features. */
  clear: () => void;
}

const EPSILON = 1e-9;

function sameCoord(a: LngLatTuple, b: LngLatTuple): boolean {
  return Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON;
}

/** Drop vertices identical to their predecessor (e.g. the double-click dupes). */
function dedupe(coords: LngLatTuple[]): LngLatTuple[] {
  return coords.filter((c, i) => i === 0 || !sameCoord(c, coords[i - 1]));
}

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || el.isContentEditable;
}

/**
 * Headless drawing state machine: wires map clicks / double-click / move /
 * keyboard into a point/line/polygon draft and a list of completed features.
 * Both <DrawControl> and <MeasureControl> are thin shells over this.
 */
export function useDraw(options: UseDrawOptions = {}): DrawEngine {
  const { map } = useMapContext();

  const [mode, setModeState] = useState<DrawMode | null>(null);
  const [features, setFeaturesState] = useState<DrawFeature[]>([]);
  const [draft, setDraftState] = useState<LngLatTuple[]>([]);
  const [cursor, setCursor] = useState<LngLatTuple | null>(null);

  // Mirrors so the map event handlers (bound once) always read fresh values.
  const modeRef = useRef(mode);
  const draftRef = useRef(draft);
  const featuresRef = useRef(features);
  const idRef = useRef(0);

  const onChangeRef = useRef(options.onChange);
  onChangeRef.current = options.onChange;
  const onCreateRef = useRef(options.onCreate);
  onCreateRef.current = options.onCreate;

  const setDraft = useCallback((next: LngLatTuple[]) => {
    draftRef.current = next;
    setDraftState(next);
  }, []);

  const commitFeatures = useCallback((next: DrawFeature[]) => {
    featuresRef.current = next;
    setFeaturesState(next);
    onChangeRef.current?.(next);
  }, []);

  const setMode = useCallback(
    (next: DrawMode | null) => {
      modeRef.current = next;
      setModeState(next);
      setDraft([]);
      setCursor(null);
    },
    [setDraft],
  );

  const finish = useCallback(() => {
    const m = modeRef.current;
    if (m == null || m === "point") return;
    const coords = dedupe(draftRef.current);
    let feature: DrawFeature | null = null;
    const id = `draw-${(idRef.current += 1)}`;
    if (m === "line" && coords.length >= 2) {
      feature = {
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
        properties: { id, mode: m },
      };
    } else if (m === "polygon" && coords.length >= 3) {
      feature = {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [[...coords, coords[0]]] },
        properties: { id, mode: m },
      };
    }
    if (!feature) return; // not enough vertices yet — keep drawing
    const next = [...featuresRef.current, feature];
    commitFeatures(next);
    onCreateRef.current?.(feature);
    setDraft([]);
    setCursor(null);
  }, [commitFeatures, setDraft]);

  const undo = useCallback(() => {
    if (draftRef.current.length > 0) {
      setDraft(draftRef.current.slice(0, -1));
    } else if (featuresRef.current.length > 0) {
      commitFeatures(featuresRef.current.slice(0, -1));
    }
  }, [commitFeatures, setDraft]);

  const remove = useCallback(
    (id: string) => {
      commitFeatures(featuresRef.current.filter((f) => f.properties.id !== id));
    },
    [commitFeatures],
  );

  const clear = useCallback(() => {
    setDraft([]);
    setCursor(null);
    commitFeatures([]);
  }, [commitFeatures, setDraft]);

  // Bind map + keyboard handlers once per map. Handlers read refs, so the
  // bindings survive mode/draft changes without re-subscribing.
  useEffect(() => {
    if (!map) return;

    const placeVertex = (p: LngLatTuple) => {
      const m = modeRef.current;
      if (!m) return;
      if (m === "point") {
        const id = `draw-${(idRef.current += 1)}`;
        const feature: DrawFeature = {
          type: "Feature",
          geometry: { type: "Point", coordinates: p },
          properties: { id, mode: "point" },
        };
        commitFeatures([...featuresRef.current, feature]);
        onCreateRef.current?.(feature);
      } else {
        setDraft([...draftRef.current, p]);
      }
    };

    const onClick = (e: MapMouseEvent) => {
      placeVertex([e.lngLat.lng, e.lngLat.lat]);
    };

    const canvas = map.getCanvas();
    const onCanvasKeyDown = (e: KeyboardEvent) => {
      if (!modeRef.current) return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        const c = map.getCenter();
        placeVertex([c.lng, c.lat]);
      }
    };
    canvas.addEventListener("keydown", onCanvasKeyDown);

    const onMove = (e: MapMouseEvent) => {
      const m = modeRef.current;
      if (!m || m === "point") return;
      setCursor([e.lngLat.lng, e.lngLat.lat]);
    };

    const onDblClick = (e: MapMouseEvent) => {
      const m = modeRef.current;
      if (!m || m === "point") return;
      e.preventDefault();
      finish();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!modeRef.current || isEditableTarget(e.target)) return;
      if (e.key === "Enter") {
        finish();
      } else if (e.key === "Escape") {
        setDraft([]);
        setCursor(null);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        if (draftRef.current.length > 0) {
          e.preventDefault();
          setDraft(draftRef.current.slice(0, -1));
        }
      }
    };

    map.on("click", onClick);
    map.on("mousemove", onMove);
    map.on("dblclick", onDblClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      map.off("click", onClick);
      map.off("mousemove", onMove);
      map.off("dblclick", onDblClick);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("keydown", onCanvasKeyDown);
    };
  }, [map, commitFeatures, finish, setDraft]);

  // Reflect the active tool onto the map: crosshair cursor, and suspend the
  // double-click-to-zoom gesture (we use double-click to finish a shape).
  useEffect(() => {
    if (!map) return;
    const drawing = mode != null;
    const multi = mode === "line" || mode === "polygon";
    const canvas = map.getCanvas();
    const prevCursor = canvas.style.cursor;
    canvas.style.cursor = drawing ? "crosshair" : prevCursor;
    if (multi) map.doubleClickZoom.disable();
    return () => {
      canvas.style.cursor = prevCursor;
      if (multi) map.doubleClickZoom.enable();
    };
  }, [map, mode]);

  return {
    mode,
    setMode,
    features,
    draft,
    cursor,
    isDrawing: (mode === "line" || mode === "polygon") && draft.length > 0,
    finish,
    undo,
    remove,
    clear,
  };
}

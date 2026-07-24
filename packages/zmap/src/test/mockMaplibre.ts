// A minimal in-memory stand-in for maplibre-gl's Map, for jsdom tests.
// Real maplibre can't run in jsdom (WebGL, workers), so React-surface tests
// mock the module boundary:
//
//   vi.mock("maplibre-gl", () => import("../test/mockMaplibre"));
//
// FakeMap models exactly what the library touches: an event emitter, source +
// layer bookkeeping, camera state, and style/cleanup flags. Tests reach the
// created instance via `lastFakeMap()` (or construct one directly) and drive
// it with `fire()`.
import { vi } from "vitest";

type Handler = (ev?: unknown) => void;

export interface FakeSource {
  id: string;
  type: string;
  data: unknown;
  options: Record<string, unknown>;
  setData: ReturnType<typeof vi.fn>;
}

export const fakeMaps: FakeMap[] = [];

/** The most recently constructed FakeMap (what a just-rendered <Map> owns). */
export function lastFakeMap(): FakeMap {
  const map = fakeMaps[fakeMaps.length - 1];
  if (!map) throw new Error("no FakeMap constructed yet");
  return map;
}

export function resetFakeMaps(): void {
  fakeMaps.length = 0;
  constructError = null;
}

let constructError: Error | null = null;
/** Make the next FakeMap construction throw (test seam for Map error handling). */
export function setFakeMapConstructError(err: Error | null): void {
  constructError = err;
}

/** Every FakeMarker constructed since the last reset (newest last). */
export const fakeMarkers: FakeMarker[] = [];

export function resetFakeMarkers(): void {
  fakeMarkers.length = 0;
}

export class FakeMap {
  options: Record<string, unknown>;
  handlers = new Map<string, Set<Handler>>();
  sources = new Map<string, FakeSource>();
  layers = new Map<string, Record<string, unknown>>();
  layerOrder: string[] = [];
  _removed = false;
  private styleLoaded = true;

  private center: [number, number];
  private zoom: number;
  private bearing: number;
  private pitch: number;

  doubleClickZoom: {
    disable: ReturnType<typeof vi.fn>;
    enable: ReturnType<typeof vi.fn>;
  } = { disable: vi.fn(), enable: vi.fn() };
  dragPan: {
    disable: ReturnType<typeof vi.fn>;
    enable: ReturnType<typeof vi.fn>;
  } = { disable: vi.fn(), enable: vi.fn() };
  boxZoom: {
    disable: ReturnType<typeof vi.fn>;
    enable: ReturnType<typeof vi.fn>;
  } = { disable: vi.fn(), enable: vi.fn() };
  private canvas = Object.assign(document.createElement("canvas"), {});

  setStyle = vi.fn((_style: unknown) => {
    // Real setStyle wipes custom sources/layers; tests that need the wipe +
    // styledata re-add flow call wipeStyle()/fire("styledata") explicitly.
  });
  setRenderWorldCopies: ReturnType<typeof vi.fn> = vi.fn();
  setPaintProperty: ReturnType<typeof vi.fn> = vi.fn();
  setLayoutProperty: ReturnType<typeof vi.fn> = vi.fn();
  fitBounds: ReturnType<typeof vi.fn> = vi.fn();
  easeTo = vi.fn((opts: Record<string, unknown>) => this.applyCamera(opts));
  jumpTo = vi.fn((opts: Record<string, unknown>) => this.applyCamera(opts));
  flyTo = vi.fn((opts: Record<string, unknown>) => this.applyCamera(opts));
  private projection: { type: string } = { type: "mercator" };
  setProjection = vi.fn((spec: { type: string }) => {
    this.projection = spec;
  });
  getProjection() {
    return this.projection;
  }

  private terrain: unknown = null;
  setTerrain = vi.fn((spec: unknown) => {
    this.terrain = spec;
  });
  getTerrain() {
    return this.terrain;
  }
  sky: unknown = null;
  setSky = vi.fn((spec: unknown) => {
    this.sky = spec;
  });

  constructor(options: Record<string, unknown> = {}) {
    if (constructError) {
      const e = constructError;
      throw e;
    }
    this.options = options;
    this.center = (options.center as [number, number]) ?? [0, 0];
    this.zoom = (options.zoom as number) ?? 0;
    this.bearing = (options.bearing as number) ?? 0;
    this.pitch = (options.pitch as number) ?? 0;
    fakeMaps.push(this);
  }

  // --- events (plain `on(event, fn)` and layer-scoped `on(event, layerId, fn)`) ---
  private key(event: string, layerId?: string): string {
    return layerId === undefined ? event : `${event}#${layerId}`;
  }
  on(event: string, layerOrHandler: string | Handler, handler?: Handler): this {
    const k =
      typeof layerOrHandler === "string"
        ? this.key(event, layerOrHandler)
        : this.key(event);
    const h = typeof layerOrHandler === "string" ? handler! : layerOrHandler;
    if (!this.handlers.has(k)) this.handlers.set(k, new Set());
    this.handlers.get(k)!.add(h);
    return this;
  }
  off(
    event: string,
    layerOrHandler: string | Handler,
    handler?: Handler,
  ): this {
    const k =
      typeof layerOrHandler === "string"
        ? this.key(event, layerOrHandler)
        : this.key(event);
    const h = typeof layerOrHandler === "string" ? handler! : layerOrHandler;
    this.handlers.get(k)?.delete(h);
    return this;
  }
  fire(event: string, payload?: unknown): this {
    for (const h of [...(this.handlers.get(event) ?? [])]) h(payload);
    return this;
  }
  /** Fire a layer-scoped event (what `map.on(event, layerId, fn)` receives). */
  fireLayer(event: string, layerId: string, payload?: unknown): this {
    for (const h of [...(this.handlers.get(this.key(event, layerId)) ?? [])])
      h(payload);
    return this;
  }
  handlerCount(event: string, layerId?: string): number {
    return this.handlers.get(this.key(event, layerId))?.size ?? 0;
  }

  // --- camera ---
  applyCamera(opts: Record<string, unknown>): void {
    if (opts.center) this.center = opts.center as [number, number];
    if (opts.zoom !== undefined) this.zoom = opts.zoom as number;
    if (opts.bearing !== undefined) this.bearing = opts.bearing as number;
    if (opts.pitch !== undefined) this.pitch = opts.pitch as number;
  }
  getCenter() {
    return { lng: this.center[0], lat: this.center[1] };
  }
  getZoom() {
    return this.zoom;
  }
  getBearing() {
    return this.bearing;
  }
  getPitch() {
    return this.pitch;
  }
  /**
   * Naive stand-in for maplibre's Mercator projection (identity lng/lat →
   * x/y) — enough for tests that only assert on relative screen positions.
   * Tests needing real projection math should override `map.project`.
   */
  project(lngLat: [number, number] | { lng: number; lat: number }): {
    x: number;
    y: number;
  } {
    const [lng, lat] = Array.isArray(lngLat)
      ? lngLat
      : [lngLat.lng, lngLat.lat];
    return { x: lng, y: lat };
  }
  /** Test-only: move the center directly, without a camera call/event. */
  setCenterForTest(center: [number, number]): void {
    this.center = center;
  }

  // --- sources & layers ---
  addSource(id: string, spec: Record<string, unknown>): this {
    const { type, data, ...options } = spec;
    this.sources.set(id, {
      id,
      type: type as string,
      data,
      options,
      setData: vi.fn(),
    });
    return this;
  }
  getSource(id: string): FakeSource | undefined {
    return this.sources.get(id);
  }
  removeSource(id: string): this {
    this.sources.delete(id);
    return this;
  }
  addLayer(layer: { id: string }, beforeId?: string): this {
    this.layers.set(layer.id, layer as Record<string, unknown>);
    const at = beforeId ? this.layerOrder.indexOf(beforeId) : -1;
    if (at >= 0) this.layerOrder.splice(at, 0, layer.id);
    else this.layerOrder.push(layer.id);
    return this;
  }
  getLayer(id: string): Record<string, unknown> | undefined {
    return this.layers.get(id);
  }
  removeLayer(id: string): this {
    this.layers.delete(id);
    this.layerOrder = this.layerOrder.filter((l) => l !== id);
    return this;
  }
  moveLayer(id: string, beforeId?: string): this {
    if (!this.layers.has(id)) return this;
    this.layerOrder = this.layerOrder.filter((l) => l !== id);
    const at = beforeId ? this.layerOrder.indexOf(beforeId) : -1;
    if (at >= 0) this.layerOrder.splice(at, 0, id);
    else this.layerOrder.push(id);
    return this;
  }

  // --- filters (what setFilter last applied, per layer) ---
  filters = new Map<string, unknown>();
  setFilter(id: string, filter: unknown): this {
    this.filters.set(id, filter);
    return this;
  }
  getFilter(id: string): unknown {
    return this.filters.get(id);
  }

  // --- feature state ---
  featureStates = new Map<string, Record<string, unknown>>();
  setFeatureState(
    target: { source: string; id: string | number },
    state: Record<string, unknown>,
  ): void {
    const k = `${target.source}:${target.id}`;
    this.featureStates.set(k, { ...this.featureStates.get(k), ...state });
  }
  removeFeatureState(
    target: { source: string; id: string | number },
    key?: string,
  ): void {
    const k = `${target.source}:${target.id}`;
    if (key === undefined) {
      this.featureStates.delete(k);
      return;
    }
    const state = this.featureStates.get(k);
    if (state) delete state[key];
  }
  getFeatureState(target: {
    source: string;
    id: string | number;
  }): Record<string, unknown> {
    return this.featureStates.get(`${target.source}:${target.id}`) ?? {};
  }

  // --- images ---
  images = new Map<string, unknown>();
  loadImage = vi.fn(async (_src: string) => ({ data: { fake: "image" } }));
  addImage(id: string, image: unknown): void {
    this.images.set(id, image);
  }
  hasImage(id: string): boolean {
    return this.images.has(id);
  }
  removeImage(id: string): void {
    this.images.delete(id);
  }

  // --- source features (stub what querySourceFeatures should return) ---
  sourceFeatures: unknown[] = [];
  querySourceFeatures(_sourceId: string): unknown[] {
    return this.sourceFeatures;
  }

  // --- style & lifecycle ---
  isStyleLoaded(): boolean {
    return this.styleLoaded;
  }
  setStyleLoaded(v: boolean): void {
    this.styleLoaded = v;
  }
  /** Simulate what a real setStyle does: wipe all custom sources and layers. */
  wipeStyle(): void {
    this.sources.clear();
    this.layers.clear();
    this.layerOrder = [];
  }
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
  remove(): void {
    this._removed = true;
    this.handlers.clear();
  }
}

/** Stand-in for maplibregl.Marker — enough for the Marker portal component. */
export class FakeMarker {
  options: Record<string, unknown>;
  lngLat: [number, number] = [0, 0];
  removed = false;
  private handlers = new Map<string, Set<Handler>>();

  constructor(options: Record<string, unknown> = {}) {
    this.options = options;
    fakeMarkers.push(this);
  }
  setLngLat(lngLat: [number, number]): this {
    this.lngLat = lngLat;
    return this;
  }
  getLngLat() {
    return { lng: this.lngLat[0], lat: this.lngLat[1] };
  }
  addTo(_map: unknown): this {
    // The real Marker mounts its element into the map container; attaching to
    // the body makes portal content reachable by DOM queries in tests.
    const el = this.options.element as HTMLElement | undefined;
    if (el) document.body.appendChild(el);
    return this;
  }
  remove(): this {
    this.removed = true;
    (this.options.element as HTMLElement | undefined)?.remove();
    return this;
  }
  on(event: string, handler: Handler): this {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return this;
  }
  off(event: string, handler: Handler): this {
    this.handlers.get(event)?.delete(handler);
    return this;
  }
  fire(event: string, payload?: unknown): this {
    for (const h of [...(this.handlers.get(event) ?? [])]) h(payload);
    return this;
  }
  setDraggable(_v: boolean): this {
    return this;
  }
  setOffset(_v: unknown): this {
    return this;
  }
  setRotation(_v: number): this {
    return this;
  }
  getElement(): HTMLElement | undefined {
    return this.options.element as HTMLElement | undefined;
  }
}

/** Stand-in for maplibregl.Popup — enough for the Popup component's a11y tests. */
export class FakePopup {
  options: Record<string, unknown>;
  private lngLat: [number, number] = [0, 0];
  private el: HTMLElement = document.createElement("div");
  removed = false;
  private handlers = new Map<string, Set<Handler>>();

  constructor(options: Record<string, unknown> = {}) {
    this.options = options;
  }
  setLngLat(lngLat: [number, number]): this {
    this.lngLat = lngLat;
    return this;
  }
  getLngLat() {
    return { lng: this.lngLat[0], lat: this.lngLat[1] };
  }
  setDOMContent(node: HTMLElement): this {
    this.el.appendChild(node);
    return this;
  }
  addTo(_map: unknown): this {
    document.body.appendChild(this.el);
    return this;
  }
  getElement(): HTMLElement {
    return this.el;
  }
  on(event: string, handler: Handler): this {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return this;
  }
  off(event: string, handler: Handler): this {
    this.handlers.get(event)?.delete(handler);
    return this;
  }
  fire(event: string, payload?: unknown): this {
    for (const h of [...(this.handlers.get(event) ?? [])]) h(payload);
    return this;
  }
  remove(): this {
    this.removed = true;
    this.el.remove();
    this.fire("close");
    return this;
  }
}

// Module shape for vi.mock("maplibre-gl", ...): the library only uses the
// default export's Map, Marker, and Popup constructors at runtime (everything
// else it imports from maplibre-gl is types, which are erased).
export default { Map: FakeMap, Marker: FakeMarker, Popup: FakePopup };

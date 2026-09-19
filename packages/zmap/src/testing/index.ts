/**
 * Test double for `maplibre-gl`, published for consumers' unit tests:
 * `vi.mock("maplibre-gl", () => import("zmapgl/testing"))`. Requires vitest.
 */
export {
  FakeMap,
  FakeMarker,
  FakePopup,
  FakeLngLat,
  fakeMaps,
  fakeMarkers,
  fakePopups,
  lastFakeMap,
  lastFakePopup,
  resetFakeMaps,
  resetFakeMarkers,
  resetFakePopups,
  setFakeMapConstructError,
} from "./mockMaplibre";
export type { FakeSource } from "./mockMaplibre";
export { default } from "./mockMaplibre";

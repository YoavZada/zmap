/**
 * Every user-visible UI string the library renders (tooltips, aria-labels,
 * menu items, legend text, transport bar). Override any subset via
 * `<Map localeText>`; unset keys fall back to `enUS`. Ship-ready locales:
 * `enUS`, `heIL`.
 */
export interface ZmapLocaleText {
  /** Accessible name for the map's root region. */
  mapLabel: string;
  /** Message shown in the fallback panel when the map fails to initialize. */
  mapLoadError: string;
  /** Default label for the built-in loading indicator. */
  mapLoading: string;
  /** Tooltip/aria-label for the zoom-in button. */
  zoomIn: string;
  /** Tooltip/aria-label for the zoom-out button. */
  zoomOut: string;
  /** Tooltip for the compass (reset-bearing) button. */
  resetBearing: string;
  /** Aria-label for the compass (reset-bearing) button. */
  resetBearingLabel: string;
  /** Tooltip for the 3D tilt toggle when it is off. */
  tilt: string;
  /** Tooltip for the 3D tilt toggle when it is on. */
  resetTilt: string;
  /** Aria-label for the 3D tilt toggle button. */
  toggleTiltLabel: string;
  /** Tooltip for the "my location" (geolocate) button. */
  myLocation: string;
  /** Aria-label for the "my location" (geolocate) button. */
  myLocationLabel: string;
  /** Tooltip for the fullscreen toggle when not fullscreen. */
  fullscreen: string;
  /** Tooltip for the fullscreen toggle when already fullscreen. */
  exitFullscreen: string;
  /** Aria-label for the fullscreen toggle button. */
  toggleFullscreenLabel: string;
  /** Scale-bar / measurement unit label for meters. */
  unitMeters: string;
  /** Scale-bar / measurement unit label for kilometers. */
  unitKilometers: string;
  /** Scale-bar / measurement unit label for feet. */
  unitFeet: string;
  /** Scale-bar / measurement unit label for miles. */
  unitMiles: string;
  /** Measurement unit label for square meters. */
  unitSquareMeters: string;
  /** Measurement unit label for square kilometers. */
  unitSquareKilometers: string;
  /** Measurement unit label for acres. */
  unitAcres: string;
  /** Measurement unit label for square miles. */
  unitSquareMiles: string;
  /** Measurement unit label for hectares. */
  unitHectares: string;
  /** Tooltip/aria-label for the draw-point tool. */
  drawPoint: string;
  /** Tooltip/aria-label for the draw-line tool. */
  drawLine: string;
  /** Tooltip/aria-label for the draw-polygon tool. */
  drawPolygon: string;
  /** Tooltip/aria-label for finishing the in-progress shape. */
  finishShape: string;
  /** Tooltip/aria-label for undoing the last drawn point. */
  undoLastPoint: string;
  /** Tooltip/aria-label for clearing every drawn shape. */
  clearAll: string;
  /** Tooltip/aria-label for the measure-distance tool. */
  measureDistance: string;
  /** Tooltip/aria-label for the measure-area tool. */
  measureArea: string;
  /** Tooltip/aria-label for clearing every measurement. */
  clearMeasurements: string;
  /** Tooltip/aria-label for the box-select tool. */
  boxSelect: string;
  /** Tooltip/aria-label for the lasso-select tool. */
  lassoSelect: string;
  /** Tooltip/aria-label for clearing the current selection. */
  clearSelection: string;
  /** Live-region hint while a keyboard box-selection's first corner is set. */
  selectKeyboardHint: string;
  /** Default heading for the layer control panel. */
  layersTitle: string;
  /** Aria-label for the collapsed layer control's trigger button. */
  showLayers: string;
  /** Aria-label for the expanded layer control's collapse button. */
  collapseLayers: string;
  /** Fallback aria-label for a legend with no title and no items/spec. */
  legendLabel: string;
  /** Aria-label suffix for a categorical legend: `count` swatches. */
  legendCategories: (count: number) => string;
  /** Aria-label suffix for a gradient/step legend spanning `from`–`to`. */
  legendColorScale: (from: string, to: string) => string;
  /** Step-band label for the lowest band ("below `value`"). */
  legendBelow: (value: string) => string;
  /** Step-band label for the highest band ("at least `value`"). */
  legendAtLeast: (value: string) => string;
  /** Step-band label for a middle band spanning `from`–`to`. */
  legendRange: (from: string, to: string) => string;
  /** Tooltip/aria-label for the play button. */
  play: string;
  /** Tooltip/aria-label for the pause button. */
  pause: string;
  /** Aria-label for the playhead scrub slider. */
  playhead: string;
  /** Tooltip for the playback-speed cycle button. */
  playbackSpeed: string;
  /** Aria-label for the playback-speed cycle button, including the current speed. */
  playbackSpeedLabel: (speed: number) => string;
  /** Default accessible name for a `<Popup>` dialog. */
  popupLabel: string;
  /** Default accessible name for an unclustered `<Cluster>` point marker. */
  clusterPointLabel: (index: number) => string;
  /** Default context-menu item: recenter the map on the clicked coordinate. */
  centerHere: string;
  /** Default context-menu item: copy the clicked coordinate. */
  copyCoordinates: string;
  /** Snackbar message shown after copying coordinates. */
  copiedCoordinates: (text: string) => string;
  /** Default context-menu item: drop a marker at the clicked coordinate. */
  dropMarker: string;
  /** Default placeholder/accessible label for the geocoder search input. */
  searchPlaceholder: string;
  /** Default empty-state text for the geocoder results list. */
  noPlacesFound: string;
}

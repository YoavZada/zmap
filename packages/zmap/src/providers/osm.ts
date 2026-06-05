import type { StyleSpecification } from "maplibre-gl";
import type { MapProvider } from "./types";

const OSM_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';

/**
 * Standard OpenStreetMap raster tiles, built as a MapLibre style on the fly.
 * One style serves both modes (OSM has no native dark raster set in v1).
 */
function osmStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: [
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: OSM_ATTRIBUTION,
      },
    },
    layers: [{ id: "osm-tiles", type: "raster", source: "osm" }],
  };
}

export const osm: MapProvider = {
  id: "osm",
  getStyle: () => osmStyle(),
  attribution: OSM_ATTRIBUTION,
};

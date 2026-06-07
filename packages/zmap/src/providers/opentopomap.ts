import type { StyleSpecification } from "maplibre-gl";
import type { MapProvider } from "./types";

const OPENTOPOMAP_ATTRIBUTION =
  'map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors, SRTM | ' +
  'style © <a href="https://opentopomap.org/" target="_blank" rel="noopener">OpenTopoMap</a> (CC-BY-SA)';

/**
 * OpenTopoMap raster tiles — free, no API key. A topographic basemap (contours,
 * hillshading, hiking detail) rendered from OpenStreetMap + SRTM elevation
 * data. Like OSM it ships a single raster style, so it looks the same in light
 * and dark. Honor its fair-use tile policy in production.
 */
function openTopoMapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      opentopomap: {
        type: "raster",
        tiles: [
          "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
          "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
          "https://c.tile.opentopomap.org/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        maxzoom: 17,
        attribution: OPENTOPOMAP_ATTRIBUTION,
      },
    },
    layers: [
      { id: "opentopomap-tiles", type: "raster", source: "opentopomap" },
    ],
  };
}

export const opentopomap: MapProvider = {
  id: "opentopomap",
  getStyle: () => openTopoMapStyle(),
  attribution: OPENTOPOMAP_ATTRIBUTION,
};

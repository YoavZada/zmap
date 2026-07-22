// Generates the bundled boundary GeoJSON the data-viz demos color:
//   src/geo/worldCountries.geo.json  — Natural Earth 1:110m country polygons
//   src/geo/usStates.geo.json        — US state polygons carrying real density
//
// Real geography is what makes a choropleth read as a choropleth (and not a
// grid of rectangles), but shipping full-resolution borders is heavy — so we
// fetch low-res sources once, strip them to the two properties the demos use,
// round coordinates to a demo-appropriate precision, and commit the result.
// Re-run with `pnpm --filter docs gen:geo` to refresh; the app imports the
// committed JSON, so builds and the e2e suite never touch the network.
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const WORLD_SRC =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";
const US_SRC =
  "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";

const outDir = fileURLToPath(new URL("../src/geo/", import.meta.url));

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json();
}

/** Round every coordinate to `dp` decimals (recurses through any nesting). */
function round(coords, dp) {
  const m = 10 ** dp;
  return typeof coords[0] === "number"
    ? [Math.round(coords[0] * m) / m, Math.round(coords[1] * m) / m]
    : coords.map((c) => round(c, dp));
}

const feature = (properties, geometry, dp) => ({
  type: "Feature",
  properties,
  geometry: {
    type: geometry.type,
    coordinates: round(geometry.coordinates, dp),
  },
});

function writePretty(name, fc) {
  // One feature per line keeps the diff reviewable without bloating the file.
  const body = fc.features.map((f) => `    ${JSON.stringify(f)}`).join(",\n");
  const json = `{ "type": "FeatureCollection", "features": [\n${body}\n] }\n`;
  writeFileSync(new URL(name, `file://${outDir}`), json);
  return json.length;
}

mkdirSync(outDir, { recursive: true });

// --- World countries: name + continent (continent drives the Europe subset). ---
const worldRaw = await getJSON(WORLD_SRC);
const world = {
  type: "FeatureCollection",
  features: worldRaw.features
    .map((f) => ({ p: f.properties, g: f.geometry }))
    .filter(({ p }) => (p.NAME ?? p.ADMIN) !== "Antarctica")
    .map(({ p, g }) =>
      feature({ name: p.NAME ?? p.ADMIN, region: p.CONTINENT }, g, 2),
    ),
};

// --- US states: real 2010-census population density (people / mi²). Drop the ---
// --- District of Columbia (an outlier that blows out the ramp) and Puerto Rico. ---
const DROP = new Set(["District of Columbia", "Puerto Rico"]);
const usRaw = await getJSON(US_SRC);
const us = {
  type: "FeatureCollection",
  features: usRaw.features
    .filter((f) => !DROP.has(f.properties.name))
    .map((f) =>
      feature(
        { name: f.properties.name, density: f.properties.density },
        f.geometry,
        3,
      ),
    ),
};

const wBytes = writePretty("worldCountries.geo.json", world);
const uBytes = writePretty("usStates.geo.json", us);

console.log(
  `worldCountries.geo.json — ${world.features.length} countries, ${(wBytes / 1024) | 0} KB`,
);
console.log(
  `usStates.geo.json       — ${us.features.length} states, ${(uBytes / 1024) | 0} KB`,
);

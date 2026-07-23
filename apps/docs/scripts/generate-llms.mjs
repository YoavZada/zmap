// Generates public/llms.txt (curated index, https://llmstxt.org) and
// public/llms-full.txt (README + component props + complete block examples)
// so AI assistants can use zmapgl correctly. Deterministic from repo content.
// Requires src/generated/props.json — run generate-props.mjs first.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(docsRoot, "../..");
const SITE = "https://yoavzada.github.io/zmap";

const readme = readFileSync(join(repoRoot, "README.md"), "utf8");
const { components } = JSON.parse(
  readFileSync(join(docsRoot, "src/generated/props.json"), "utf8"),
);

// Curated route index — keep in sync with apps/docs/src/nav.ts.
const routes = [
  [
    "Introduction",
    "/",
    "install zmapgl and drop a themed map into a React + MUI app",
  ],
  [
    "Blocks",
    "/blocks",
    "five complete copy-paste apps: store locator, regional analytics, flight network, delivery tracker, 3D city",
  ],
  [
    "Providers & Theming",
    "/providers",
    "basemap providers and automatic MUI light/dark theming",
  ],
  [
    "Next.js & SSR guide",
    "/guides/nextjs",
    "one stylesheet import, server-component friendly SSR setup",
  ],
  [
    "Markers",
    "/markers",
    "MUI content at coordinates, draggable markers, symbol labels",
  ],
  [
    "Popups & Tooltips",
    "/popups",
    "click popups and hover tooltips anchored to coordinates",
  ],
  [
    "Controls",
    "/controls",
    "zoom, compass, geolocate, fullscreen, pitch, scale",
  ],
  [
    "Interaction",
    "/interaction",
    "drawing, measuring, context menus, box/lasso selection",
  ],
  ["Routes", "/routes", "declarative polylines with palette-token colors"],
  ["Arcs", "/arcs", "curved bezier/geodesic connection lines"],
  ["Clusters", "/clusters", "MapLibre clustering rendered as MUI markers"],
  [
    "Layers",
    "/layers",
    "toggleable overlays, GeoJSON, points, heatmaps, legends",
  ],
  [
    "Choropleth",
    "/choropleth",
    "data-driven polygon coloring with ramps and legends",
  ],
  ["Hexbins & grids", "/hexbins", "hex/square binning, flat or extruded"],
  [
    "Time playback",
    "/time",
    "animate time-stamped points with a transport bar",
  ],
  ["3D Extrusion", "/extrusion", "extrude polygons into 3D"],
  [
    "API Reference",
    "/api",
    "every exported component, hook, provider, util, and type",
  ],
  ["Changelog", "/changelog", "release history"],
];

const index = `# zmapgl

> MUI-native, theme-aware React map components built on MapLibre GL. Drop a
> \`<Map>\` into a Material UI app and markers, popups, controls, and data
> layers render as MUI components that follow the app theme, including
> automatic light/dark basemaps.

Install: \`npm install zmapgl @mui/material @mui/icons-material @emotion/react @emotion/styled\`

## Docs

${routes.map(([label, path, desc]) => `- [${label}](${SITE}${path}): ${desc}`).join("\n")}

## Package

- [npm](https://www.npmjs.com/package/zmapgl)
- [GitHub](https://github.com/YoavZada/zmap)

## Full reference

- [llms-full.txt](${SITE}/llms-full.txt): the README, every component's props, and five complete example apps
`;

const propLine = (p) => {
  const parts = [
    `\`${p.name}\` (\`${p.type}\`${p.required ? ", required" : ""})`,
  ];
  if (p.defaultValue != null) parts.push(`default: \`${p.defaultValue}\``);
  if (p.deprecated) {
    parts.push(`DEPRECATED: ${p.deprecated}`);
  } else if (
    p.description &&
    !p.description.toLowerCase().startsWith("deprecated")
  ) {
    parts.push(p.description);
  }
  return `- ${parts.join(" — ")}`;
};

const propsSection = Object.entries(components)
  .map(
    ([name, c]) =>
      `## ${name}\n\n${c.description ?? ""}\n\n${c.props.map(propLine).join("\n")}`,
  )
  .join("\n\n");

const blocksDir = join(docsRoot, "src/blocks");
const blockFiles = readdirSync(blocksDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name))
  .flatMap((d) =>
    readdirSync(join(blocksDir, d.name))
      .filter((f) => f.endsWith("Block.tsx"))
      .sort((a, b) => a.localeCompare(b))
      .map((f) => join(blocksDir, d.name, f)),
  );

const blocksSection = blockFiles
  .map((f) => {
    const name = f.replace(/\\/g, "/").split("/").at(-1);
    return `## ${name}\n\n\`\`\`tsx\n${readFileSync(f, "utf8")}\n\`\`\``;
  })
  .join("\n\n");

const full = `${readme}

---

# Component props (generated)

${propsSection}

---

# Complete examples (Blocks) — each file is a self-contained app

${blocksSection}
`;

writeFileSync(join(docsRoot, "public/llms.txt"), index);
writeFileSync(join(docsRoot, "public/llms-full.txt"), full);
console.log(
  `llms.txt (${index.length} chars) + llms-full.txt (${full.length} chars) written`,
);

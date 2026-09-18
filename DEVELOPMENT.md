# Development

zmap is a **pnpm monorepo**. This doc covers the workspace layout, day-to-day
commands, and the architecture. For the library's public API and usage, see the
[root README](README.md) and the [package README](packages/zmap/README.md). Repo
conventions (component + styling rules) live in [CLAUDE.md](CLAUDE.md).

## Workspaces

| Path               | Name         | What it is                                                        |
| ------------------ | ------------ | ----------------------------------------------------------------- |
| `packages/zmap`    | `zmap`       | The published library. Built with **tsup** → ESM + CJS + `.d.ts`. |
| `apps/docs`        | `docs`       | Vite + React + MUI docs/showcase with a live demo per feature.    |
| `apps/pathfinder`  | `pathfinder` | A Dijkstra pathfinding demo app built **with** zmap.              |

Both apps alias `zmap` to the library *source*, so editing components updates the
apps instantly via HMR — no library rebuild needed while iterating.

## Prerequisites

- **Node 18+** (developed on Node 24).
- **pnpm** via corepack:
  ```bash
  corepack enable pnpm && corepack prepare pnpm@9.15.0 --activate
  ```

## Commands

Run from the repo root. Build/test/typecheck/dev go through **Turborepo**
(`turbo.json`) — cached and parallel; a re-run with no changes prints
`>>> FULL TURBO`.

```bash
pnpm install          # install all workspaces

pnpm docs             # run the docs/showcase site (Vite, HMR vs library source)
pnpm pathfinder       # run the Dijkstra pathfinder demo

pnpm build            # build every package (lib + both apps), cached
pnpm build:lib        # build only the zmap library (packages/zmap)
pnpm test             # library unit tests (Vitest — arc + provider utils)
pnpm typecheck        # typecheck every workspace
pnpm lint             # biome lint the repo (root pass, not turbo)
pnpm format           # biome format --write (root pass, not turbo)
pnpm check            # biome check --write — lint + format + safe fixes
```

## Architecture

zmap wraps **MapLibre GL directly** (no react-map-gl) and exposes the instance to
children through React context.

- **`Map` lifecycle.** Creates `new maplibregl.Map(...)` once, stores it in
  context, and gates children behind a `loaded` flag. Cleans up on unmount.
- **Theme-aware styling.** `colorScheme="auto"` reads the MUI theme; when the mode
  flips, `Map` calls `setStyle()` to swap the basemap. Since `setStyle` wipes
  custom layers, every data component re-adds itself on the `styledata` event —
  centralized in [`useMapLayer`](packages/zmap/src/hooks/useMapLayer.ts).
- **Overlays via portals.** `Marker`/`Popup`/`Tooltip` create MapLibre overlays
  backed by a detached DOM node and `createPortal` arbitrary MUI content into it.
  Popups read MUI theme tokens (via CSS variables) so they match the surface,
  dark mode included.
- **Controls.** `MapControls` is an absolutely-positioned MUI `Paper`/`IconButton`
  cluster, so it inherits the app theme for free.
- **Routes & arcs.** `Route` renders a LineString layer; `Arc` generates a bezier
  or great-circle path ([`utils/arc.ts`](packages/zmap/src/utils/arc.ts)) and
  renders it the same way. Colors accept palette tokens (`"primary.main"`).
- **Clustering.** `Cluster` uses MapLibre's native clustering source and renders
  bubbles/points as themed MUI **DOM markers** (avoids cross-provider glyph
  issues). An invisible anchor layer forces MapLibre to tile the source so
  `querySourceFeatures` returns the clusters.
- **Providers.** `resolveStyle()` accepts a built-in id (`carto`/`osm`), a custom
  `MapProvider`, a raw style URL, or a full `StyleSpecification` — the pluggable
  escape hatch.

### Library build

`tsup` emits ESM + CJS + types; `react`, `react-dom`, MUI and Emotion are
`peerDependencies`, `maplibre-gl` is a dependency. CSS is not a side-effect
import from the entry — `copy-css.mjs` publishes MapLibre's stylesheet as
`dist/styles.css` (the `zmapgl/styles.css` subpath export), and consumers add
`import "zmapgl/styles.css"` once in their own app entry.

## Conventions

Components follow the rules in [CLAUDE.md](CLAUDE.md), enforced by two skills:

- **`/zmap-component`** — scaffold a component: default-exported `FC`, named props
  type, colocated `*.style.ts`, barrel registration in `src/index.ts`.
- **`/zmap-style`** — `sx` styling lives in a colocated `*.style.ts` consumed as
  `Styles.<key>`; compose with the array form, never object spread.

## Running & screenshotting the app

The **`/run-zmap`** skill builds, launches, and drives the docs app headlessly
(MapLibre needs WebGL), capturing screenshots over the Chrome DevTools Protocol —
useful for visually verifying map features in light and dark mode. The driver is
[`.claude/skills/run-zmap/driver.mjs`](.claude/skills/run-zmap/driver.mjs); see
its [`SKILL.md`](.claude/skills/run-zmap/SKILL.md).

## Verification

```bash
pnpm typecheck && pnpm lint && pnpm --filter zmapgl test && pnpm --filter zmapgl build
```

Then `pnpm docs`, open the site, toggle the theme (top-right), and confirm the
basemap swaps light/dark and every feature page renders.

## Releasing

Releases are automated with [changesets](https://github.com/changesets/changesets):

1. Any PR that changes `packages/zmap` in a user-visible way adds a changeset
   (`pnpm changeset` — pick the bump, write the entry). Docs/infra-only PRs
   skip this.
2. On merge to main, `.github/workflows/release.yml` opens or updates a
   **"chore: version packages"** PR (version bump + changelog). That PR is
   created with the workflow's `GITHUB_TOKEN`, so `ci.yml` does not run on
   it — accepted: it only contains version/changelog edits, and the release
   job re-runs typecheck + tests + build before publishing.
3. Merging the version PR publishes `zmapgl` to npm with provenance, tags
   `zmapgl@x.y.z`, and creates the GitHub Release.

Manual fallback (needs npm access): `pnpm release`.

### Bundle-size budget

`pnpm size` (size-limit) gates CI. Baselines measured 2026-07-23:
`import { Map }` = 2.88 kB, full barrel = 17.85 kB; budgets are
baseline + 15%. When the gate fires, either shrink the change or consciously
raise the budget in `.size-limit.json` in the same PR.

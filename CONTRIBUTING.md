# Contributing to zmap

Thanks for taking the time to contribute! This is a pnpm monorepo — the
published library (`zmapgl`) lives in `packages/zmap`, alongside a docs site
and a pathfinder demo app. See [DEVELOPMENT.md](DEVELOPMENT.md) for the full
workspace layout and architecture notes.

## Setup

```bash
git clone https://github.com/YoavZada/zmap.git
cd zmap
corepack enable pnpm   # pnpm@9, pinned via packageManager
pnpm install           # Node >=20.19 (or >=22.12)
```

## Commands

```bash
pnpm test        # library unit tests (Vitest)
pnpm typecheck   # tsc --noEmit across every workspace
pnpm lint        # biome lint . (repo-wide, not turbo)
pnpm e2e         # Playwright e2e against the docs site
pnpm docs        # run the docs/showcase app with HMR against library source
```

Run a single library test file:

```bash
pnpm --filter zmapgl exec vitest run src/utils/arc.test.ts
```

## Conventions

The full rules live in `CLAUDE.md` (not published, but linked from
DEVELOPMENT.md's Conventions section); the essentials:

- **Styling** — a component's `sx` styling lives in a colocated
  `*.style.ts` file, consumed via a single default import named `Styles`.
- **One folder per component** — under `packages/zmap/src/components`, each
  component gets its own folder with a thin `index.ts` barrel re-exporting
  the default and its props type.
- **Props types** are named exports (`<Component>Props`); the component
  itself is the default export.
- **Layer components** share one prop vocabulary (`fillColor`/`strokeColor`,
  `beforeId`, `layerOverrides`, callbacks with the raw MapLibre event last)
  and use `useMapLayer()` so they survive a `setStyle()` theme flip — never
  call `map.addLayer()` directly.
- **`featureId`** (promoteId/generateId) is supported on every GeoJSON layer;
  use `layerIds()` when you need the underlying MapLibre layer ids.
- React-surface tests never run real `maplibre-gl` — mock the module
  boundary with the shared `FakeMap`
  (`vi.mock("maplibre-gl", () => import("../test/mockMaplibre"))`) and drive
  it via `lastFakeMap()`.
- MUI imports are deep (`@mui/material/Paper`), never the barrel.

## Changesets

Any PR that changes `packages/zmap` in a user-visible way needs a changeset:

```bash
pnpm changeset
```

Pick the semver bump and write a short, user-facing entry. Docs- or
infra-only PRs (like this one) don't need one.

## Version pins

`templates/vite/package.json` pins an exact `zmapgl` range for the starter
template; bump it by hand as part of cutting a release.

## Pull request checklist

- [ ] Changeset added, if `packages/zmap` changed in a user-visible way
- [ ] Tests added or updated
- [ ] `pnpm typecheck && pnpm lint` pass locally
- [ ] Docs props tables regenerated (`pnpm --filter docs gen:props`) if
      component props or JSDoc changed

## Code of conduct

Participation in this project is governed by our
[Code of Conduct](CODE_OF_CONDUCT.md).

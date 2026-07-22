# Batch 0 — Release plumbing & quick wins

**Date:** 2026-07-22
**Status:** Approved (design), pending implementation plan
**Scope:** Repo/package/docs infrastructure. No library code changes.

## Context

zmapgl is at 0.5.0 (published on npm; repo currently **private**). Releases are
manual: bump version, commit, draft a GitHub Release, `publish.yml` gates and
publishes. A hand-written Keep-a-Changelog `packages/zmap/CHANGELOG.md` exists
through 0.4.0. The docs site deploys to Netlify + GitHub Pages on every push
to main.

This batch is the first of a sequenced roadmap chosen in brainstorming
(2026-07-22): Batch 0 (this) → v0.6.0 SSR/adoption unblockers → v0.7.0
GeocoderControl → v0.8.0 globe/terrain/raster → v0.9.0 hardening toward 1.0.
Batch 0 goes first because changesets changes how every later milestone ships.

## Decisions (locked with user)

1. **Repo goes public in this batch** — unlocks changelog PR links, npm
   provenance, and everything the adoption milestone needs.
2. **Full release automation**: changesets "Version Packages" PR + CI publish
   on merge. Existing `NPM_TOKEN` (production environment) is reused.
3. **Version PR runs without `ci.yml`** (GITHUB_TOKEN-created PRs don't
   trigger workflows). Accepted: the PR only contains version bumps +
   changelog text, and the release job re-runs all gates before publishing.
   No PAT required from the user.

## Workstreams

### W1 — Repo goes public (first; W2 depends on it)

- Pre-flight: secret-scan full git history (GitHub secret scanning via API +
  a local gitleaks/trufflehog pass); verify `LICENSE` (exists, MIT); sweep
  workflow files/comments for private info.
- **User action:** flip visibility in GitHub Settings.
- Post-flip: npm provenance is re-added as part of W2's release workflow
  (`id-token: write` + provenance flag), per the existing note in
  `publish.yml`.
- Fork-PR safety: secrets (`GEMINI_API_KEY`, `NETLIFY_AUTH_TOKEN`,
  `NPM_TOKEN`) are already unavailable to fork PRs by GitHub default; confirm
  no workflow uses `pull_request_target`.

### W2 — Changesets: version PR + CI publish

- Add `@changesets/cli` at the repo root; `.changeset/config.json` with
  `access: public`, `baseBranch: main`, changelog generator
  `@changesets/changelog-github` (`repo: "YoavZada/zmap"`).
- Only `zmapgl` is versioned/published; private workspaces (`apps/*`,
  `tools/*`) are excluded via `privatePackages: { version: false, tag: false }`.
- New `release.yml` on push to main using `changesets/action`:
  - With pending changesets → opens/updates the "Version Packages" PR.
  - When that PR merges → job runs typecheck + test + build (the gates
    currently in `publish.yml`), then `changeset publish` with `NPM_TOKEN` +
    provenance, and creates the git tag + GitHub Release with the changelog
    entry as body. The job declares `environment: production` — that's where
    `NPM_TOKEN` lives today.
- `publish.yml` is deleted. Local fallback documented: `pnpm changeset publish`.
- Existing hand-written CHANGELOG history is preserved; changesets prepends
  new entries above it.
- **Known changes in convention:** tags move from `v0.5.0` style to
  changesets' `zmapgl@0.6.0` style; changelog entries become per-changeset
  bullets with PR links rather than curated prose (prose can still be edited
  into the Version PR before merge).
- Contributor flow: every user-facing PR adds a changeset file
  (`pnpm changeset`); infra-only PRs skip it (`pnpm changeset --empty` not
  required — no changeset simply means no release).

### W3 — Docs changelog page

- New `/changelog` route in `apps/docs` rendering
  `packages/zmap/CHANGELOG.md` via Vite `?raw` import + `react-markdown`
  (docs-only dependency), styled with existing docs typography components and
  `RouteMeta` title/description.
- Linked from the footer (not the navbar — navbar IA stays as designed).
- Covered by the e2e route smoke like other routes.

### W4 — size-limit in CI

- `size-limit` + small-lib preset measuring the built `dist/`:
  1. `import { Map } from "zmapgl"` — tree-shaking honesty check;
  2. full barrel import.
- Externals: react, react-dom, @mui/*, @emotion/*, maplibre-gl — we measure
  zmapgl's own cost.
- Budgets = current baseline (measured during implementation) + ~15%
  headroom, recorded in the config with the baseline date.
- Runs as a `ci.yml` step after the library build. Plain failing check; no
  PR-comment action.

### W5 — llms.txt + llms-full.txt

- `apps/docs/scripts/generate-llms.mjs`, invoked from the docs `prebuild`
  (alongside `generate-props.mjs`), emitting into `apps/docs/public/`:
  - `llms.txt` — curated index: what zmapgl is, install line, links to docs
    routes (components, blocks, API, changelog) and npm.
  - `llms-full.txt` — assembled from the root README, the generated
    `props.json` tables (flattened to text), and the five self-contained
    block sources under `apps/docs/src/blocks/`.
- Served statically by both Netlify and Pages deploys at `/llms.txt`.
- Hand-written header/curation lives in the script; regeneration is
  deterministic from repo content.

### W6 — README fixes + OG image

- Root `README.md`: fix npm badge (points at package `zmap`, must be
  `zmapgl`); sync the feature list with the 0.5 surface (SymbolLayer,
  HexbinLayer, TimePlayback, DrawControl, MeasureControl, SelectControl,
  ContextMenu, ChoroplethLayer, ExtrusionLayer, Legend); make the live docs
  site URL prominent near the top.
- `packages/zmap/README.md` (npm-facing): same content pass; add the badge
  row (correct package name) since npm renders this file.
- OG image: 1200×630 PNG rendered from a styled HTML card via the existing
  Playwright tooling (`tools/e2e` browsers) → `apps/docs/public/og.png`,
  referenced by the OG meta tags that already ship. Same image reused by both
  deploy targets.

## Sequencing

W1 → W2 (needs public repo for changelog links + provenance) → W3 (nicer once
W2's first generated entry exists, but not blocked) · W4, W5, W6 independent,
any order.

## Verification

- W1: secret scans clean; repo loads logged-out; Pages/Netlify unaffected.
- W2: dry-run `changeset version` locally on a throwaway branch; first real
  release observed end-to-end (Version PR → merge → npm publish with
  provenance → GitHub Release).
- W3: e2e route smoke passes; page renders both generated and historical
  changelog sections in light/dark.
- W4: `pnpm size` (or equivalent) green locally and in CI; deliberately
  fat import fails the check when budget is exceeded (spot-verified once).
- W5: `/llms.txt` and `/llms-full.txt` reachable on the deployed docs site;
  content regenerates deterministically.
- W6: badges resolve; npm page renders the updated README after next publish;
  OG card validates in a link-preview checker.

## Out of scope

CONTRIBUTING/issue templates, comparison page, StackBlitz buttons (all
v0.6.0); any change under `packages/zmap/src`.

## Risks

- **History secrets**: the repo was private for its whole life; the pre-flight
  scan is the mitigation. If anything is found, rotate + decide between
  history rewrite vs acceptance before flipping.
- **Changesets tag-format change** may surprise tooling that assumed `v*`
  tags (nothing in-repo depends on it today; `publish.yml`'s tag guard is
  deleted with it).
- **Version PR without CI** is accepted by decision #3; the publish job
  remains fully gated.

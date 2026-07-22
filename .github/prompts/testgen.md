# PR test generation — instructions

You are running inside a GitHub Actions runner on the head branch of a PR
against `main` in the zmap monorepo. Your job: decide whether the changed
files warrant new end-to-end coverage; if so, inject missing `data-testid`
hooks and generate Playwright specs, verify them, and commit to the PR branch.

Read `CLAUDE.md` at the repo root first — all repo conventions apply.

## 1. Judge

Inspect the actual changes: `git diff origin/main...HEAD -- <changed files>`.

Generate tests only when the diff introduces **new observable behavior**: a
new component or demo, a new prop that changes rendering or interaction, new
event handling, new UI states. Do NOT generate tests for refactors, renames,
type-only changes, style tweaks, or behavior the existing suite already
covers (read `tools/e2e/tests/*.spec.ts` to check).

If no test is warranted, post a short comment explaining why and stop —
make no commits:

```
gh pr comment <PR-NUMBER> --body "**testgen**: skipped — <one-line reason>."
```

## 2. Inject data-testids (changed files only)

Where a generated spec needs a stable selector that doesn't exist, add
`data-testid` attributes — but only inside files already changed by this PR.
Follow the existing naming style (kebab-case, e.g. `theme-toggle`,
`demo-section`). Prefer existing hooks before adding new ones:

- map ready: `[data-zmap-loaded]` on the map container (set by the library)
- map instances: `window.__zmapMaps()` in the browser (docs only)
- demo sections: `[data-testid="demo-section"]`, anchor `id` = slugified title
- MapLibre DOM: `.maplibregl-marker`, `.maplibregl-canvas`, `.zmap-popup`

Never restructure components to add a testid; if a clean hook isn't possible,
select by role/text instead.

## 3. Write the spec

- Location: `tools/e2e/tests/generated/<scope>.spec.ts` (kebab-case scope
  named after the feature, not the PR).
- Every `test()` title MUST contain the tag `@generated` — that keeps it
  advisory in CI until a human promotes it by removing the tag.
- Use the helpers in `tools/e2e/helpers/map.ts` (`setColorMode`,
  `revealMaps`, `revealDemo`, `customLayerIds`, `collectPageIssues`) and copy
  the style of the existing specs in `tools/e2e/tests/`.
- Assert structure and behavior, never tile pixels or screenshots. Always
  pin the color mode with `setColorMode` before `page.goto`.
- Keep it small: one spec file, the few assertions that pin the new
  behavior. No exhaustive prop matrices.

## 4. Verify before committing

```
pnpm --filter @zmap/e2e exec playwright test tests/generated/<file> --reporter=list
```

(The Playwright config auto-starts the docs server; in CI it builds the real
bundle first — the first run is slow, that's expected.)

Also run `pnpm typecheck` and `pnpm lint`. If the spec fails, fix it — at
most two fix attempts. If it still fails, do NOT commit it; comment on the PR
with what you tried and stop. Never commit a failing or flaky spec.

## 5. Commit and push

Stage ONLY: the changed files you added testids to, and the new spec file(s)
under `tools/e2e/tests/generated/`. Nothing else.

```
git add <files>
git commit -m "test(e2e): generated coverage for <scope> [skip-testgen]"
git push
```

The `[skip-testgen]` marker is the loop guard — never omit it, never
force-push, never amend or rebase the author's commits.

Then leave a one-paragraph PR comment summarizing: which files got testids,
what the spec covers, and that it runs as advisory until the `@generated` tag
is removed in review.

# Batch 0 — Release Plumbing & Quick Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate zmapgl releases with changesets (Version PR → CI publish with provenance), take the repo public safely, and ship four quick wins: docs `/changelog` page, size-limit CI gate, `llms.txt`, README fixes + OG image.

**Architecture:** All work lands on one branch (`chore/batch0-release-plumbing`) as one PR. Changesets replaces the release-triggered `publish.yml` with a push-to-main `release.yml` (Version PR on pending changesets; publish on merge). Docs additions ride the existing Vite/react-router/e2e infrastructure. No changes under `packages/zmap/src`.

**Tech Stack:** pnpm 9 monorepo, Turborepo, Biome, changesets, size-limit, react-markdown, Playwright (existing `tools/e2e`), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-07-22-batch0-release-plumbing-design.md`

## Global Constraints

- Repo root: `c:\Users\yoavz\MyProjects\git\maps\zmap`. Windows machine — run commands through the Bash tool (Git Bash) unless a step says PowerShell.
- Branch: create `chore/batch0-release-plumbing` off `main` at start; one commit per task; PR to `main` at the end.
- **Never run repo-wide `pnpm check` / `biome --write .`** — it rewrites every file's line endings on this machine (no `.gitattributes` + `autocrlf=true`). Format only files you created/edited; verify with `git diff --stat` (never trust `git status` counts alone).
- Biome style: double quotes, semicolons, trailing commas, 2-space indent, line width 80.
- Docs app follows the library conventions: folder-per-component with `index.ts` barrel, `FC` arrow + `type` props, styles in `*.style.ts` imported as `Styles`, MUI deep imports (`@mui/material/Box`).
- **Do not modify anything under `packages/zmap/src`** (spec: out of scope).
- Published package is `zmapgl` (repo dir is `zmap`). Repo slug: `YoavZada/zmap`. Docs site: `https://yoavzada.github.io/zmap`.
- **User-only actions** (flag, never attempt): flipping repo visibility, changing GitHub settings, adding secrets, merging PRs.

---

### Task 1: Pre-flight secret scan (repo → public readiness)

**Files:**
- No repo changes. Produces a verification report in the task output plus a user-action checklist.

**Interfaces:**
- Produces: a go/no-go verdict for the user's visibility flip. Later tasks do not depend on the flip having happened.

- [ ] **Step 1: Download and run gitleaks over full history**

```bash
mkdir -p "$TMPDIR/gitleaks" 2>/dev/null || mkdir -p /tmp/gitleaks
cd /tmp/gitleaks 2>/dev/null || cd "$TMPDIR/gitleaks"
curl -sSL -o gitleaks.zip https://github.com/gitleaks/gitleaks/releases/download/v8.18.4/gitleaks_8.18.4_windows_x64.zip
unzip -o gitleaks.zip
```

Then scan (full history, all refs):

```bash
cd /c/Users/yoavz/MyProjects/git/maps/zmap
/tmp/gitleaks/gitleaks.exe detect --source . --log-opts="--all" -v
```

Expected: exit 0, `no leaks found`. If leaks are reported: STOP, report each finding (file, commit, rule) to the user, and do not proceed to the flip checklist — rotation/history-rewrite is the user's call.

- [ ] **Step 2: Sweep workflows and tracked files for private references**

```bash
grep -rniE "token|secret|password|api[_-]?key" .github/workflows/ --include="*.yml" | grep -vE "secrets\.|GITHUB_TOKEN|NODE_AUTH_TOKEN|NPM_CONFIG|token'|key:"
git ls-files | grep -iE "\.env|credentials|\.pem|\.key$"
```

Expected: first command returns only benign lines (comments about secrets); second returns nothing. `LICENSE` exists (verified during design; MIT).

- [ ] **Step 3: Report and hand the user their checklist**

Report scan results, then list the user actions (do NOT perform them):

1. **Flip visibility**: GitHub → Settings → General → Danger Zone → Change visibility → Public.
2. **Allow the release bot to open PRs**: Settings → Actions → General → Workflow permissions → check "Allow GitHub Actions to create and approve pull requests" (required by Task 3's workflow).
3. Confirm `NPM_TOKEN` in the `production` environment is still a valid npm automation token.

These can happen any time before the batch PR merges.

---

### Task 2: Changesets tooling + CHANGELOG prep

**Files:**
- Create: `.changeset/config.json` (via init, then edit)
- Modify: `package.json` (root — scripts)
- Modify: `packages/zmap/CHANGELOG.md` (move intro prose into an HTML comment)
- Modify: `DEVELOPMENT.md` (add "Releasing" section)

**Interfaces:**
- Produces: root scripts `changeset` and `release` (`release` = build + `changeset publish`) — Task 3's workflow calls `pnpm release`. Config publishes only `zmapgl`; private workspaces excluded via `privatePackages`.

- [ ] **Step 1: Install and init changesets**

```bash
pnpm add -D -w @changesets/cli @changesets/changelog-github
pnpm changeset init
```

Expected: `.changeset/config.json` and `.changeset/README.md` created.

- [ ] **Step 2: Configure**

Edit `.changeset/config.json` to (keep whatever `$schema` init wrote):

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": ["@changesets/changelog-github", { "repo": "YoavZada/zmap" }],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": [],
  "privatePackages": { "version": false, "tag": false }
}
```

Add to root `package.json` `"scripts"`:

```json
"changeset": "changeset",
"release": "pnpm --filter zmapgl build && changeset publish"
```

- [ ] **Step 3: Dry-run the version mechanics**

Everything in `.changeset/` and the CHANGELOG is still uncommitted — so revert ONLY with targeted `git checkout` on tracked files and manual re-edits; never `git clean` here (it would delete the untracked `config.json`).

The GitHub changelog generator needs a `GITHUB_TOKEN`, which isn't available locally — temporarily set `"changelog": "@changesets/cli/changelog"` in `.changeset/config.json`, then:

```bash
cat > .changeset/dry-run-test.md <<'EOF'
---
"zmapgl": patch
---

Dry-run entry — must not be committed.
EOF
pnpm changeset version
```

Verify:
- `packages/zmap/package.json` version became `0.5.1`;
- `packages/zmap/CHANGELOG.md` gained `## 0.5.1` **immediately after the H1 — i.e. ABOVE the intro paragraph**, demonstrating the ordering problem Step 4 fixes;
- no `apps/*` or `tools/*` package.json changed;
- `.changeset/dry-run-test.md` was consumed (deleted) by the version command.

Revert the dry run:

```bash
git checkout -- packages/zmap/package.json packages/zmap/CHANGELOG.md
```

Then re-edit `.changeset/config.json` back to the `["@changesets/changelog-github", { "repo": "YoavZada/zmap" }]` tuple. Final state check: `git status --short` shows only this task's intended files; `.changeset/` contains exactly `config.json` and `README.md`; no `0.5.1` anywhere.

- [ ] **Step 4: Protect the CHANGELOG intro from changesets insertion**

As the dry run demonstrated, `changeset version` inserts new entries directly after the first H1, above the intro paragraph that sits between `# Changelog` and `## [0.4.0]` — orphaning the prose below new entries. Wrap the prose in an HTML comment so ordering no longer matters (react-markdown in Task 4 won't render it, and raw-file readers still see it):

```markdown
# Changelog

<!--
All notable changes to **zmapgl** are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project
adheres to [Semantic Versioning](https://semver.org/). Entries from 0.5.1
onward are generated by changesets.
-->

## [0.4.0] — 2026-07-19
```

(Replace the existing intro paragraph with this comment block; keep everything from `## [0.4.0]` down untouched. Note there is no `## [0.5.0]` entry — 0.5.0 shipped without one; that's fine.)

- [ ] **Step 5: Document the release flow**

Append to `DEVELOPMENT.md`:

```markdown
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
```

- [ ] **Step 6: Verify and commit**

```bash
pnpm changeset status
git add -A && git status --short   # expect ONLY the files this task touches
git commit -m "chore: add changesets (version-PR + publish flow config)"
```

`changeset status` should report no changesets present (exit 0).

---

### Task 3: release.yml replaces publish.yml

**Files:**
- Create: `.github/workflows/release.yml`
- Delete: `.github/workflows/publish.yml`

**Interfaces:**
- Consumes: root `release` script from Task 2.
- Produces: the automated release pipeline (Version PR → publish with provenance → tag `zmapgl@x.y.z` → GitHub Release).

- [ ] **Step 1: Write `.github/workflows/release.yml`**

```yaml
name: Release

# Changesets-driven releases. With pending changesets on main, the action
# opens/updates a "chore: version packages" PR; merging that PR makes this
# workflow publish zmapgl to npm (with provenance), tag zmapgl@x.y.z, and
# create the GitHub Release. The version PR is created with GITHUB_TOKEN, so
# ci.yml does not run on it — accepted trade-off: it only contains
# version/changelog edits, and this job re-runs all gates before publishing.
#
# Requires (user setup): repo public (for provenance), NPM_TOKEN in the
# `production` environment, and Settings → Actions → "Allow GitHub Actions
# to create and approve pull requests" enabled.
on:
  push:
    branches: [main]

concurrency:
  group: release
  cancel-in-progress: false

permissions:
  contents: write
  pull-requests: write
  id-token: write

jobs:
  release:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          # Full history so the changelog generator can attribute changesets.
          fetch-depth: 0

      - name: Set up pnpm
        uses: pnpm/action-setup@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm --filter zmapgl typecheck

      - name: Test
        run: pnpm --filter zmapgl test

      - name: Version PR or publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
          commit: "chore: version packages"
          title: "chore: version packages"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          # npm provenance — requires a public repo + id-token: write.
          NPM_CONFIG_PROVENANCE: "true"
```

- [ ] **Step 2: Delete `publish.yml`**

```bash
git rm .github/workflows/publish.yml
```

- [ ] **Step 3: Validate YAML and commit**

```bash
pnpm dlx js-yaml .github/workflows/release.yml > /dev/null && echo YAML-OK
git add -A
git commit -m "ci: changesets release workflow replaces release-triggered publish"
```

Expected: `YAML-OK`. (The workflow itself can only be exercised on main — end-to-end verification happens in Task 9's handoff.)

---

### Task 4: Docs `/changelog` page

**Files:**
- Create: `apps/docs/src/pages/ChangelogPage/ChangelogPage.tsx`
- Create: `apps/docs/src/pages/ChangelogPage/changelogPage.style.ts`
- Create: `apps/docs/src/pages/ChangelogPage/index.ts`
- Modify: `apps/docs/src/App.tsx` (route)
- Modify: `apps/docs/src/nav.ts` (navItems entry — drives RouteMeta + Search)
- Modify: `apps/docs/src/layout/Footer/Footer.tsx` (product link)
- Modify: `tools/e2e/routes.ts` and `tools/e2e/driver.mjs` (route lists)
- Modify: `apps/docs/package.json` (react-markdown dependency)

**Interfaces:**
- Consumes: `packages/zmap/CHANGELOG.md` via Vite `?raw` (same mechanism the blocks registry already uses for `.tsx?raw`).
- Produces: route `/changelog`, present in `navItems` (label "Changelog") and the e2e ROUTES lists with `hasMap: false, hasGlLayers: false`.

- [ ] **Step 1: Add dependency**

```bash
pnpm add react-markdown --filter docs
```

- [ ] **Step 2: Add the failing e2e route entries first**

`tools/e2e/routes.ts` — after the `/api` entry:

```ts
{ path: "/changelog", name: "changelog", hasMap: false, hasGlLayers: false },
```

`tools/e2e/driver.mjs` — in its `ROUTES` array after `["/api", "api"],`:

```js
["/changelog", "changelog"],
```

- [ ] **Step 3: Run the new smoke tests (expect them to be inconclusive)**

```bash
pnpm --filter @zmap/e2e exec playwright test smoke --grep "/changelog"
```

Honest expectation: these 2 tests (light + dark) likely PASS even now, because the unimplemented route renders the 404 page *inside the docs chrome* and the smoke spec is structure-only. That's fine — they guard regressions, not implementation. The real "does it render" check is Step 7's content verification. Do not delete the entries.

- [ ] **Step 4: Create the page**

First open `apps/docs/src/pages/ApiPage/ApiPage.tsx` and one existing `index.ts` barrel to confirm the local `PageHeader` props and page wrapper idiom — mirror them exactly. The code below assumes `PageHeader` takes `title` + `description` (its use across 14 pages); adjust to what you see, keeping content identical.

`apps/docs/src/pages/ChangelogPage/changelogPage.style.ts`:

```ts
import type { SxProps, Theme } from "@mui/material/styles";

// Markdown body — the raw CHANGELOG.md rendered through react-markdown,
// styled to read like the rest of the docs typography.
const content: SxProps<Theme> = (theme) => ({
  maxWidth: 760,
  "& h2": {
    ...theme.typography.h5,
    fontWeight: 700,
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(1.5),
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  "& h3": {
    ...theme.typography.h6,
    fontWeight: 600,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
  },
  "& p, & li": {
    ...theme.typography.body1,
    color: theme.palette.text.secondary,
    lineHeight: 1.7,
  },
  "& li": { marginBottom: theme.spacing(0.5) },
  "& a": {
    color: theme.palette.primary.main,
    textDecorationColor: "inherit",
  },
  "& code": {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.85em",
    padding: theme.spacing(0.2, 0.6),
    borderRadius: 1,
    backgroundColor: theme.palette.action.hover,
  },
  "& strong": { color: theme.palette.text.primary },
});

const styles: { content: SxProps<Theme> } = { content };

export default styles;
```

`apps/docs/src/pages/ChangelogPage/ChangelogPage.tsx`:

```tsx
import type { FC } from "react";
import Box from "@mui/material/Box";
import ReactMarkdown from "react-markdown";
import changelog from "../../../../../packages/zmap/CHANGELOG.md?raw";
import PageHeader from "../../components/PageHeader";
import Styles from "./changelogPage.style";

const ChangelogPage: FC = () => {
  return (
    <>
      <PageHeader
        title="Changelog"
        description="Release history for zmapgl — every version and its changes, newest first."
      />
      <Box sx={Styles.content}>
        {/* The file's own H1 duplicates the PageHeader title — drop it. */}
        <ReactMarkdown components={{ h1: () => null }}>
          {changelog}
        </ReactMarkdown>
      </Box>
    </>
  );
};

export default ChangelogPage;
```

`apps/docs/src/pages/ChangelogPage/index.ts`:

```ts
export { default } from "./ChangelogPage";
```

If TypeScript rejects the `?raw` import, add `/// <reference types="vite/client" />` handling by confirming `apps/docs/src/vite-env.d.ts` (or equivalent) exists — the blocks registry already imports `.tsx?raw`, so the plumbing is proven; match whatever it does.

- [ ] **Step 5: Wire route, nav, footer**

`apps/docs/src/App.tsx` — add import and route (before the `*` catch-all):

```tsx
import ChangelogPage from "./pages/ChangelogPage";
// …
<Route path="/changelog" element={<ChangelogPage />} />
```

`apps/docs/src/nav.ts` — add import and a `navItems` entry after the `/api` item (this feeds RouteMeta's title/description and Ctrl-K search; it does NOT appear in `componentGroups`/`destinations`, so no sidebar/tab changes):

```ts
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
// … after the /api item:
{
  path: "/changelog",
  label: "Changelog",
  icon: HistoryOutlined,
  description:
    "Release history for zmapgl — every version and its changes, newest first.",
},
```

`apps/docs/src/layout/Footer/Footer.tsx` — extend the `product` array:

```ts
{ label: "Changelog", to: "/changelog" },
```

- [ ] **Step 6: Typecheck + lint**

```bash
pnpm typecheck
pnpm lint
```

Expected: both green.

- [ ] **Step 7: Verify the page really renders content**

```bash
pnpm --filter @zmap/e2e exec playwright test smoke --grep "/changelog"
```

Expected: 2 PASS. Then the content check (guards against the 404-also-passes case from Step 3): start the dev server (`pnpm docs`, background), confirm `http://localhost:5173/changelog` shows the "0.4.0" heading and the intro HTML comment is NOT visible, in both light and dark (theme toggle), then stop the server. The `/run-zmap` skill can drive this headlessly if preferred.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "docs: /changelog page rendering the package CHANGELOG"
```

---

### Task 5: size-limit gate in CI

**Files:**
- Create: `.size-limit.json` (repo root)
- Modify: `package.json` (root — devDeps via pnpm, `size` script)
- Modify: `.github/workflows/ci.yml` (quality job steps)
- Modify: `DEVELOPMENT.md` (baseline note)

**Interfaces:**
- Consumes: `packages/zmap/dist/index.js` (built by `pnpm build:lib`).
- Produces: `pnpm size` command, run by `ci.yml`.

- [ ] **Step 1: Install and configure without limits**

```bash
pnpm add -D -w size-limit @size-limit/preset-small-lib
pnpm build:lib
```

Create `.size-limit.json` (no `limit` keys yet):

```json
[
  {
    "name": "import { Map } (tree-shaken)",
    "path": "packages/zmap/dist/index.js",
    "import": "{ Map }",
    "ignore": [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@mui/material",
      "@mui/icons-material",
      "@mui/system",
      "@emotion/react",
      "@emotion/styled",
      "maplibre-gl"
    ]
  },
  {
    "name": "full barrel",
    "path": "packages/zmap/dist/index.js",
    "import": "*",
    "ignore": [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@mui/material",
      "@mui/icons-material",
      "@mui/system",
      "@emotion/react",
      "@emotion/styled",
      "maplibre-gl"
    ]
  }
]
```

Add root script: `"size": "size-limit"`.

- [ ] **Step 2: Measure the baseline**

```bash
pnpm size
```

Record both reported sizes. If the run errors on the CSS side-effect import (`maplibre-gl/dist/maplibre-gl.css` not resolvable as external), add `"maplibre-gl/dist/maplibre-gl.css"` to both `ignore` arrays and rerun.

- [ ] **Step 3: Set budgets = baseline + 15%**

For each entry add `"limit": "<ceil(measured × 1.15)> kB"` (e.g. measured 42.3 kB → `"49 kB"`). Rerun `pnpm size` — expected: both entries PASS.

- [ ] **Step 4: Prove the gate can fail**

Temporarily set the first entry's limit to `"1 kB"`, run `pnpm size`, expect exit code ≠ 0 with an over-limit message. Restore the real limit and rerun to green.

- [ ] **Step 5: Wire into CI**

In `.github/workflows/ci.yml`, append to the **quality** job after the "Unit tests" step:

```yaml
      - name: Build library
        run: pnpm build:lib

      - name: Size limit
        run: pnpm size
```

- [ ] **Step 6: Record the baseline and commit**

Append to `DEVELOPMENT.md` (under the "Releasing" section from Task 2):

```markdown
### Bundle-size budget

`pnpm size` (size-limit) gates CI. Baselines measured 2026-07-22:
`import { Map }` = <measured> kB, full barrel = <measured> kB; budgets are
baseline + 15%. When the gate fires, either shrink the change or consciously
raise the budget in `.size-limit.json` in the same PR.
```

(Fill in the two measured numbers from Step 2.)

```bash
pnpm dlx js-yaml .github/workflows/ci.yml > /dev/null && echo YAML-OK
git add -A
git commit -m "ci: size-limit budget on the built library"
```

---

### Task 6: llms.txt + llms-full.txt generation

**Files:**
- Create: `apps/docs/scripts/generate-llms.mjs`
- Modify: `apps/docs/package.json` (prebuild chain + `gen:llms` script)
- Modify: `.gitignore` (generated outputs)

**Interfaces:**
- Consumes: root `README.md`, `apps/docs/src/generated/props.json` (shape: `{ components: { [Name]: { description, props: [{ name, type, required, defaultValue, description, deprecated }] } }, exports: … }`), block sources `apps/docs/src/blocks/*/[A-Z]*Block.tsx`.
- Produces: `apps/docs/public/llms.txt` and `apps/docs/public/llms-full.txt`, regenerated on every docs build.

- [ ] **Step 1: Write the generator**

`apps/docs/scripts/generate-llms.mjs`:

```js
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
  ["Introduction", "/", "install zmapgl and drop a themed map into a React + MUI app"],
  ["Blocks", "/blocks", "five complete copy-paste apps: store locator, regional analytics, flight network, delivery tracker, 3D city"],
  ["Providers & Theming", "/providers", "basemap providers and automatic MUI light/dark theming"],
  ["Markers", "/markers", "MUI content at coordinates, draggable markers, symbol labels"],
  ["Popups & Tooltips", "/popups", "click popups and hover tooltips anchored to coordinates"],
  ["Controls", "/controls", "zoom, compass, geolocate, fullscreen, pitch, scale"],
  ["Interaction", "/interaction", "drawing, measuring, context menus, box/lasso selection"],
  ["Routes", "/routes", "declarative polylines with palette-token colors"],
  ["Arcs", "/arcs", "curved bezier/geodesic connection lines"],
  ["Clusters", "/clusters", "MapLibre clustering rendered as MUI markers"],
  ["Layers", "/layers", "toggleable overlays, GeoJSON, points, heatmaps, legends"],
  ["Choropleth", "/choropleth", "data-driven polygon coloring with ramps and legends"],
  ["Hexbins & grids", "/hexbins", "hex/square binning, flat or extruded"],
  ["Time playback", "/time", "animate time-stamped points with a transport bar"],
  ["3D Extrusion", "/extrusion", "extrude polygons into 3D"],
  ["API Reference", "/api", "every exported component, hook, provider, util, and type"],
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
  const parts = [`\`${p.name}\` (\`${p.type}\`${p.required ? ", required" : ""})`];
  if (p.defaultValue != null) parts.push(`default: \`${p.defaultValue}\``);
  if (p.description) parts.push(p.description);
  if (p.deprecated) parts.push(`DEPRECATED: ${p.deprecated}`);
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
  .flatMap((d) =>
    readdirSync(join(blocksDir, d.name))
      .filter((f) => f.endsWith("Block.tsx"))
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
```

- [ ] **Step 2: Wire scripts**

`apps/docs/package.json`:

```json
"gen:llms": "node scripts/generate-llms.mjs",
"prebuild": "node scripts/generate-props.mjs && node scripts/generate-llms.mjs",
```

Append to root `.gitignore`:

```
apps/docs/public/llms.txt
apps/docs/public/llms-full.txt
```

- [ ] **Step 3: Run and verify output**

```bash
pnpm --filter docs gen:props
pnpm --filter docs gen:llms
grep -c "^## " apps/docs/public/llms-full.txt
grep "llms-full" apps/docs/public/llms.txt
```

Expected: script prints both sizes; `llms-full.txt` has 25+ `## ` sections (components + blocks); `llms.txt` links to `llms-full.txt`.

- [ ] **Step 4: Verify the build ships them**

```bash
pnpm --filter docs build
ls apps/docs/dist/llms.txt apps/docs/dist/llms-full.txt
```

Expected: both files exist in `dist/`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: generate llms.txt + llms-full.txt for AI assistants"
```

---

### Task 7: README fixes + release changeset

**Files:**
- Modify: `README.md` (root)
- Modify: `packages/zmap/README.md`
- Create: `.changeset/readme-refresh.md`

**Interfaces:**
- Produces: the changeset that triggers the first automated release (0.5.1) after merge — the end-to-end test of Tasks 2–3.

- [ ] **Step 1: Fix the root README**

1. **Badge bug** — the npm badge queries the wrong package. Change:
   `https://img.shields.io/npm/v/zmap.svg` → `https://img.shields.io/npm/v/zmapgl.svg` (the link target is already correct).
2. **Docs link** — prepend to the header link row:
   `[**Docs & live demos**](https://yoavzada.github.io/zmap) · ` (before "Quick start").
3. **Components table** — add the missing rows (after the existing `GeoJSONLayer` row), matching the table's tone:

```markdown
| `SymbolLayer`     | GPU text labels/icons for many points.                          |
| `ChoroplethLayer` | Data-driven polygon coloring with ramps and hover states.       |
| `HexbinLayer`     | Aggregates points into hex/square bins, flat or extruded.       |
| `ExtrusionLayer`  | Extrudes polygons into 3D prisms (buildings, data heights).     |
| `TimePlayback`    | Animates time-stamped points with a themed transport bar.       |
| `DrawControl`     | Draw points, lines, and polygons with a themed toolbar.         |
| `MeasureControl`  | Measure distances and areas interactively.                      |
| `SelectControl`   | Box and lasso selection over map features.                      |
| `ContextMenu`     | Right-click menu with MUI menu items at the clicked location.   |
| `Legend`          | Themed legend panel for color ramps and categories.             |
```

4. **Hooks line** — replace with:
   ``Hooks: `useMap()` (the raw MapLibre instance), `useMapLayer()`, `useColorScheme()`, `useFeatureState()`, `useDraw()`, `useLayerVisibility()`.``

- [ ] **Step 2: Cross-check both READMEs against the real export surface**

```bash
grep -oE 'export \{ default as \w+' packages/zmap/src/index.ts | sed 's/.*as //' | sort > /tmp/exports.txt
cat /tmp/exports.txt
```

For each of the ~25 component names: confirm it appears in the root README components table AND in `packages/zmap/README.md`'s tables; add any missing rows in the same style. (The package README is newer and likely more complete — verify, don't assume.)

- [ ] **Step 3: Add a badge row to the npm-facing README**

In `packages/zmap/README.md`, under the opening bold line, add:

```markdown
[![npm version](https://img.shields.io/npm/v/zmapgl.svg)](https://www.npmjs.com/package/zmapgl)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/YoavZada/zmap/blob/main/LICENSE)
[![types: TypeScript](https://img.shields.io/badge/types-TypeScript-3178C6.svg)](https://yoavzada.github.io/zmap/api)
```

- [ ] **Step 4: Create the changeset**

`.changeset/readme-refresh.md`:

```markdown
---
"zmapgl": patch
---

Refresh the npm README: badges, a complete component table, and a prominent link to the docs site.
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm changeset status
git add -A
git commit -m "docs: README refresh (badges, full component table) + release changeset"
```

Expected: `changeset status` now lists `zmapgl` with a patch bump.

---

### Task 8: OG image

**Files:**
- Create: `tools/e2e/scripts/og-template.html`
- Create: `tools/e2e/scripts/generate-og.mjs`
- Create: `apps/docs/public/og.png` (generated, committed)
- Modify: `apps/docs/index.html` (meta tags)

**Interfaces:**
- Consumes: Playwright's chromium from `tools/e2e` (already installed).
- Produces: `https://yoavzada.github.io/zmap/og.png` once deployed.

- [ ] **Step 1: Write the card template**

`tools/e2e/scripts/og-template.html` — premium-minimal (no chips/badges), theme-independent dark card:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1200px;
        height: 630px;
        overflow: hidden;
        font-family: "Inter", system-ui, -apple-system, sans-serif;
        background:
          radial-gradient(1000px 600px at 15% 0%, #1c2b4a 0%, transparent 60%),
          radial-gradient(800px 500px at 100% 100%, #14273a 0%, transparent 55%),
          #0b1120;
        color: #f3f6fc;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 96px;
      }
      /* faint dot grid — reads as a map graticule without being literal */
      body::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: radial-gradient(rgba(148, 170, 210, 0.14) 1.5px, transparent 1.5px);
        background-size: 42px 42px;
      }
      .wordmark { font-size: 120px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
      .wordmark .accent {
        background: linear-gradient(120deg, #7aa7ff, #4dd6c1);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .tagline { margin-top: 28px; font-size: 34px; font-weight: 500; color: #aebad0; max-width: 820px; line-height: 1.35; }
      .url { position: absolute; left: 96px; bottom: 56px; font-size: 24px; font-weight: 500; color: #6f7f9c; letter-spacing: 0.01em; }
      .rule { position: absolute; left: 96px; bottom: 104px; width: 120px; height: 3px; border-radius: 2px;
        background: linear-gradient(90deg, #7aa7ff, #4dd6c1); }
    </style>
  </head>
  <body>
    <div class="wordmark">z<span class="accent">map</span></div>
    <div class="tagline">MUI-native map components for React — theme-aware maps built on MapLibre&nbsp;GL.</div>
    <div class="rule"></div>
    <div class="url">yoavzada.github.io/zmap</div>
  </body>
</html>
```

- [ ] **Step 2: Write the generator**

`tools/e2e/scripts/generate-og.mjs`:

```js
// One-shot: renders og-template.html to apps/docs/public/og.png (2× for
// crispness; 1200×630 logical). Rerun after editing the template.
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../../../apps/docs/public/og.png");

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
await page.goto(pathToFileURL(join(here, "og-template.html")).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();
console.log("wrote", out);
```

- [ ] **Step 3: Generate and verify dimensions**

```bash
pnpm --filter @zmap/e2e exec node scripts/generate-og.mjs
pnpm --filter @zmap/e2e exec node -e "const b=require('fs').readFileSync('../../apps/docs/public/og.png'); console.log(b.readUInt32BE(16)+'x'+b.readUInt32BE(20))"
```

Expected: `wrote …og.png`, then `2400x1260`. Read the PNG with the Read tool and eyeball it: wordmark crisp, tagline legible, no clipping.

- [ ] **Step 4: Wire the meta tags**

In `apps/docs/index.html`: after the `og:site_name` meta, add:

```html
    <meta property="og:url" content="https://yoavzada.github.io/zmap/" />
    <meta
      property="og:image"
      content="https://yoavzada.github.io/zmap/og.png"
    />
    <meta
      name="twitter:image"
      content="https://yoavzada.github.io/zmap/og.png"
    />
```

and change the existing twitter card line to:

```html
    <meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 5: Verify build + commit**

```bash
pnpm --filter docs build
ls apps/docs/dist/og.png
git add -A
git commit -m "docs: OG image card + large-image meta tags"
```

---

### Task 9: Full verification, PR, and handoff

**Files:**
- No new changes; runs the full gate and opens the PR.

- [ ] **Step 1: Full local gates**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm size
pnpm e2e
```

Expected: all green. (Locally, the e2e webServer starts the Vite dev server; in CI it builds and serves the production bundle — both are valid runs of the same suite.) Check `git diff --stat main...HEAD` — only intended files.

- [ ] **Step 2: Push and open the PR**

```bash
git push -u origin chore/batch0-release-plumbing
```

Open a PR titled `chore: Batch 0 — changesets releases, /changelog, size-limit, llms.txt, README + OG` against `main`, body summarizing the six workstreams + linking the spec, ending with the standard generated-with footer. Use the GitHub MCP `create_pull_request` tool (no `gh` CLI on this machine).

- [ ] **Step 3: Hand the user the post-merge checklist**

1. Before merging: flip repo to **public** + enable **"Allow GitHub Actions to create and approve pull requests"** (from Task 1; provenance publish fails on a private repo).
2. Merge the batch PR → `release.yml` opens **"chore: version packages"** (0.5.1).
3. Merge that Version PR → verify: npm shows 0.5.1 with a provenance badge and the refreshed README; repo has tag `zmapgl@0.5.1` + a GitHub Release; docs site `/changelog` shows the 0.5.1 entry after the Pages/Netlify deploy.

---

## Self-review notes (spec coverage)

- W1 → Task 1 · W2 → Tasks 2, 3 · W3 → Task 4 · W4 → Task 5 · W5 → Task 6 · W6 → Tasks 7, 8 · Verification section → per-task verify steps + Task 9.
- Spec's "dry-run changeset version on a throwaway branch" → Task 2 Step 4 (in-place with full revert; the changelog-github generator is swapped for the local dry-run because it needs GITHUB_TOKEN — CI validates the real generator on the first release).
- Spec's "deliberately fat import fails the check" → Task 5 Step 4.

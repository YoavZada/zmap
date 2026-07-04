# zmap docs

The documentation and showcase site for [`zmap`](../../packages/zmap) — a Vite +
React + MUI app with live, interactive demos of every component.

This app is **private** (`"private": true`) and is not published; it exists to
develop and demonstrate the library.

## Run it

From the **repo root** (recommended — uses the workspace toolchain):

```bash
pnpm install          # once, installs all workspaces
pnpm docs             # start the docs site with HMR
```

Or from this directory:

```bash
pnpm dev              # vite dev server
pnpm build            # production build → dist/
pnpm preview          # serve the production build
pnpm typecheck        # tsc --noEmit
```

## Live against library source

`vite.config.ts` aliases the `zmapgl` import to the library **source**
(`../../packages/zmap/src/index.ts`), not its built output:

```ts
resolve: {
  alias: {
    zmapgl: ".../packages/zmap/src/index.ts";
  }
}
```

So editing a component in `packages/zmap/src` updates the docs instantly via HMR —
there's no need to run `pnpm build` while iterating.

## Structure

| Path             | What                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages`      | One page per component/topic; each maps to a route.                                                                                                                                                     |
| `src/demos`      | Self-contained demo components, one folder per page. Each is imported twice: as a component (the live preview) and via `?raw` (the displayed source) — so the code shown is exactly the code that runs. |
| `src/components` | Shared docs UI (`DemoSection`, `CodeBlock`, `PropsTable`).                                                                                                                                              |
| `src/generated`  | `props.json` — component props + every library export, generated from source by `pnpm gen:props` (also runs on `prebuild`). Committed.                                                                  |
| `src/layout`     | App shell (`Layout`) — app bar, nav drawer, dark-mode toggle.                                                                                                                                           |
| `src/nav.ts`     | The nav items / routes (add a page → add an entry here).                                                                                                                                                |
| `src/data.ts`    | Sample geodata used by the demos.                                                                                                                                                                       |
| `src/theme.tsx`  | MUI theme + light/dark color-mode context.                                                                                                                                                              |

Routes (from `src/nav.ts`): Introduction, Providers & Theming, Markers,
Popups & Tooltips, Controls, Interaction, Routes, Arcs, Clusters, Layers,
Choropleth, Hexbins & grids, Time playback, 3D Extrusion, API Reference.

## Conventions

This app follows the repo conventions (see the root [`CLAUDE.md`](../../CLAUDE.md)):
component `sx` styling lives in colocated `*.style.ts` files imported as `Styles`,
and components are default-exported `FC`s with a named props type.

## Adding a demo page

1. Create `src/pages/<Topic>Page.tsx` (default-export `FC`, colocated
   `<topic>Page.style.ts` if it needs more than trivial `sx`).
2. Add a `<Route>` in `src/App.tsx` and a nav entry in `src/nav.ts`.
3. Write each demo as a self-contained component in `src/demos/<route>/`,
   then wire it into a `DemoSection`:

   ```tsx
   import MyDemo from "../demos/topic/MyDemo";
   import myDemoSource from "../demos/topic/MyDemo.tsx?raw";

   <DemoSection title="…" code={myDemoSource} demo={<MyDemo />} />;
   ```

   Demo files are displayed verbatim as the Code tab, so they should read
   like consumer code: deep MUI imports, `zmapgl` imports, data from
   `../../data`, and trivial inline `sx` (no `*.style.ts` for demos). If a
   file needs docs-only setup that shouldn't be displayed, put it above a
   `// ---cut---` line.

4. Add `<PropsTable component="X" />` for each component the page demos.
   If the library's props/JSDoc changed, run `pnpm gen:props` to refresh
   `src/generated/props.json`.

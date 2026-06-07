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

`vite.config.ts` aliases the `zmap` import to the library **source**
(`../../packages/zmap/src/index.ts`), not its built output:

```ts
resolve: {
  alias: {
    zmap: ".../packages/zmap/src/index.ts";
  }
}
```

So editing a component in `packages/zmap/src` updates the docs instantly via HMR —
there's no need to run `pnpm build` while iterating.

## Structure

| Path             | What                                                          |
| ---------------- | ------------------------------------------------------------- |
| `src/pages`      | One page per component/topic; each maps to a route.           |
| `src/components` | Shared docs UI (`DemoSection`, `CodeBlock`).                  |
| `src/layout`     | App shell (`Layout`) — app bar, nav drawer, dark-mode toggle. |
| `src/nav.ts`     | The nav items / routes (add a page → add an entry here).      |
| `src/data.ts`    | Sample geodata used by the demos.                             |
| `src/theme.tsx`  | MUI theme + light/dark color-mode context.                    |

Routes (from `src/nav.ts`): Introduction, Providers & Theming, Markers,
Popups & Tooltips, Controls, Routes, Arcs, Clusters.

## Conventions

This app follows the repo conventions (see the root [`CLAUDE.md`](../../CLAUDE.md)):
component `sx` styling lives in colocated `*.style.ts` files imported as `Styles`,
and components are default-exported `FC`s with a named props type.

## Adding a demo page

1. Create `src/pages/<Topic>Page.tsx` (default-export `FC`, colocated
   `<topic>Page.style.ts` if it needs more than trivial `sx`).
2. Add a `<Route>` in `src/App.tsx` and a nav entry in `src/nav.ts`.
3. Use `DemoSection` to pair a live preview with its source snippet.

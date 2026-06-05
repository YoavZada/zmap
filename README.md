# zmap monorepo

**MUI-native map components built on MapLibre GL.** Markers, popups, tooltips,
controls, routes, arcs and clustering — composable, theme-aware, and pluggable
across basemap providers (CARTO, OpenStreetMap, or any MapLibre style).

## Workspaces

| Path             | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `packages/zmap`  | The published library (`zmap`). Built with tsup → ESM + CJS. |
| `apps/docs`      | Vite + React + MUI docs/showcase site with live demos.       |

## Development

This repo uses **pnpm** workspaces (enable via `corepack enable pnpm`).

```bash
pnpm install          # install all workspaces
pnpm docs             # run the docs site (Vite, with HMR against library source)
pnpm build            # build the library (packages/zmap)
pnpm test             # run library unit tests (Vitest)
pnpm typecheck        # typecheck every workspace
pnpm lint             # lint the repo
```

The docs app aliases `zmap` to the library source, so editing components updates
the docs instantly — no rebuild needed while iterating.

## Architecture

- **Engine:** MapLibre GL, wrapped directly. React components manage the
  imperative map lifecycle and expose the instance via context (`useMap()`).
- **Theming:** every styled surface is MUI. `Map` reads the MUI theme and swaps
  the basemap style on light/dark changes. Because `setStyle` clears custom
  layers, data components re-add themselves on `styledata` via `useMapLayer`.
- **Overlays:** markers, popups and tooltips render arbitrary MUI content through
  React portals into MapLibre overlays.
- **Styling convention:** component `sx` styles live in colocated `*.style.ts`
  files, imported as `Styles` (see `packages/zmap/src/components/*.style.ts`).

See `packages/zmap/README.md` for the public API and usage.

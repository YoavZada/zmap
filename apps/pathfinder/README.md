# pathfinder

An interactive demo of **Dijkstra's shortest-path algorithm**, built on the
[`zmap`](../../packages/zmap) map components.

Click the map to drop a start point **A** and a destination **B**. Press **Find
shortest path** and watch the algorithm fan out across a simulated road network,
settling nodes outward from A until it reaches B — then the shortest route is
drawn on top.

## What it shows

- **Pick two points** — clicks snap to the nearest intersection (graph node).
- **Two cost metrics** — optimize for *shortest distance* (edge weight = road
  length in meters) or *fewest stops* (edge weight = 1 per hop). Same Dijkstra,
  different weights.
- **Live visualization** — the magenta **search tree** is Dijkstra's frontier
  expanding outward; the blue line is the final **shortest path**. Stats show
  total distance, number of segments, and how many nodes were explored.
- **Drag to re-route** — drag the A/B markers to recompute instantly.

## The road network

There's no external routing service. The network is generated procedurally
(`src/lib/network.ts`): a jittered grid of intersections over Manhattan with a
fraction of street segments removed, so the shortest path has to wind around
"blocks" rather than going straight. It's seeded, so it looks the same on every
reload. The real basemap shows underneath for context.

## Run it

From the repo root:

```bash
pnpm install
pnpm pathfinder     # vite dev server for this app
```

Or from this directory: `pnpm dev`.

## How it fits together

| File | Responsibility |
| --- | --- |
| `src/lib/network.ts` | Generate the seeded, connected road graph. |
| `src/lib/dijkstra.ts` | Dijkstra with a binary min-heap; records settle order for the animation. |
| `src/lib/geo.ts` | Haversine distance + nearest-node snapping. |
| `src/hooks/usePathfinder.ts` | State machine: clicks → run → `requestAnimationFrame` search/draw animation. |
| `src/components/MapCanvas.tsx` | `<Map>` + all layers wired together. |
| `src/components/NetworkLayer.tsx` | The base graph (`GeoJSONLayer`). |
| `src/components/SearchTreeLayer.tsx` | The animated search frontier (`GeoJSONLayer`). |
| `src/components/PathLayer.tsx` | The final path (`Route`). |
| `src/components/Endpoints.tsx` | Draggable A/B markers (`Marker`). |
| `src/components/ControlPanel.tsx` | Controls, status, stats, legend. |

# pathfinder

An interactive **route optimizer** over the real street network, built on the
[`zmap`](../../packages/zmap) map components.

Click the map to drop points **anywhere** — on a street or not. Each point snaps
to the nearest street and the best driving route between them is drawn on top.
Drop a third (or fourth, …) point and choose how they're connected: let the
engine **optimize** the visiting order into the fastest tour, or keep **your own
order** (visited as dropped).

## What it shows

- **Start anywhere** — pick a city (New York, Tel Aviv, London, Berlin, Paris,
  …) from _Start location_ to fly the map there; switching clears the points.
- **Drop points anywhere** — no need to click exactly on a road. Each point
  snaps to the nearest street; a faint dashed line shows that off-street link
  (it doesn't count toward the distance).
- **Real streets** — routes follow the actual roads on the basemap, via the
  public [OSRM](https://project-osrm.org/) routing service (OpenStreetMap data).
- **Your order or optimized** — a toggle picks how 3+ points are connected:
  _In my order_ visits them as dropped (OSRM's `route` through all waypoints);
  _Optimized_ solves an open traveling-salesman path from the first point
  (OSRM's `trip`). Markers are numbered in the resulting visiting order.
- **Live updates** — add, drag, or remove a point and the route recomputes;
  the polyline draws itself back on. Stats show total distance and driving time.

## Routing

There's no local graph or hand-rolled algorithm. Requests go to the public OSRM
demo server (`router.project-osrm.org`), which routes over OpenStreetMap roads:

- **2 points** → `/route` — the best driving route between them.
- **3+ points** → `/trip` — the optimal open tour visiting every point.

OSRM's `driving` profile optimizes by travel **time**, so the optimized order is
the _fastest_ tour; the distance shown is along that route (occasionally a hair
longer than a different order that's slower but shorter). The public server has
no distance-objective option.

The server is rate-limited and meant for light demo traffic; an internet
connection is required (the same as for the basemap tiles).

## Run it

From the repo root:

```bash
pnpm install
pnpm pathfinder     # vite dev server for this app
```

Or from this directory: `pnpm dev`.

## How it fits together

| File                                | Responsibility                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/lib/osrm.ts`                   | OSRM client: `/route` and `/trip`, parsing geometry, order, and snapped points.                |
| `src/lib/geo.ts`                    | Distance / duration formatting helpers.                                                        |
| `src/hooks/usePathfinder.ts`        | State machine: points → fetch route (cancellable) → `requestAnimationFrame` draw-on animation. |
| `src/components/MapCanvas.tsx`      | `<Map>` + all layers wired together.                                                           |
| `src/components/PathLayer.tsx`      | The route polyline (`Route`).                                                                  |
| `src/components/ConnectorLayer.tsx` | Dashed links from each point to its snapped street position (`GeoJSONLayer`).                  |
| `src/components/Waypoints.tsx`      | Draggable, numbered point markers (`Marker`).                                                  |
| `src/components/ControlPanel.tsx`   | Controls, status, stats, legend.                                                               |

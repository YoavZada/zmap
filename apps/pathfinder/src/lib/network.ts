import { mulberry32 } from "./random";
import { haversineMeters } from "./geo";
import type {
  AdjacencyEntry,
  GraphEdge,
  GraphNode,
  RoadNetwork,
} from "./types";

export type NetworkOptions = {
  /** Map center as [lng, lat]; the grid is laid out around it. */
  center: [number, number];
  cols: number;
  rows: number;
  /** Total extent in degrees as [lngSpan, latSpan]. */
  span: [number, number];
  /** 0..1 fraction of a cell each node is randomly nudged by (organic look). */
  jitter: number;
  /** 0..1 chance a grid edge is dropped, forcing the route to detour. */
  dropProbability: number;
  seed: number;
};

/**
 * Builds a city-like road network: a grid of intersections, jittered so it
 * reads as organic, with a fraction of street segments removed so the shortest
 * path has to wind around "blocks" instead of going straight. The result is
 * always a single connected component (see `ensureConnected`).
 */
export function generateRoadNetwork(opts: NetworkOptions): RoadNetwork {
  const { center, cols, rows, span, jitter, dropProbability, seed } = opts;
  const rng = mulberry32(seed);

  const [cLng, cLat] = center;
  const [lngSpan, latSpan] = span;
  const lngStep = lngSpan / (cols - 1);
  const latStep = latSpan / (rows - 1);
  const lng0 = cLng - lngSpan / 2;
  const lat0 = cLat - latSpan / 2;
  const indexAt = (col: number, row: number) => row * cols + col;

  const nodes: GraphNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const jLng = (rng() - 0.5) * jitter * lngStep;
      const jLat = (rng() - 0.5) * jitter * latStep;
      nodes.push({
        id: indexAt(col, row),
        lng: lng0 + col * lngStep + jLng,
        lat: lat0 + row * latStep + jLat,
      });
    }
  }

  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const addEdge = (a: number, b: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    const na = nodes[a];
    const nb = nodes[b];
    edges.push({
      id: edges.length,
      a,
      b,
      length: haversineMeters([na.lng, na.lat], [nb.lng, nb.lat]),
    });
  };

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const here = indexAt(col, row);
      if (col + 1 < cols && rng() > dropProbability) {
        addEdge(here, indexAt(col + 1, row));
      }
      if (row + 1 < rows && rng() > dropProbability) {
        addEdge(here, indexAt(col, row + 1));
      }
    }
  }

  ensureConnected(nodes, edges, seen);
  return { nodes, edges, adjacency: buildAdjacency(nodes, edges) };
}

/**
 * Dropping edges can leave isolated pockets. Find connected components with
 * union-find and stitch any stragglers onto the largest component via their
 * geometrically nearest pair of nodes.
 */
function ensureConnected(
  nodes: GraphNode[],
  edges: GraphEdge[],
  seen: Set<string>,
): void {
  const parent = nodes.map((_, i) => i);
  const find = (x: number): number =>
    parent[x] === x ? x : (parent[x] = find(parent[x]));
  const union = (a: number, b: number) => {
    parent[find(a)] = find(b);
  };
  for (const e of edges) union(e.a, e.b);

  const comps = new Map<number, number[]>();
  for (let i = 0; i < nodes.length; i++) {
    const root = find(i);
    const arr = comps.get(root);
    if (arr) arr.push(i);
    else comps.set(root, [i]);
  }
  if (comps.size <= 1) return;

  let main = [...comps.keys()][0];
  for (const root of comps.keys()) {
    if (comps.get(root)!.length > comps.get(main)!.length) main = root;
  }
  const mainNodes = comps.get(main)!;

  for (const [root, members] of comps) {
    if (root === main) continue;
    let bestA = members[0];
    let bestB = mainNodes[0];
    let bestD = Infinity;
    for (const ia of members) {
      for (const ib of mainNodes) {
        const d = haversineMeters(
          [nodes[ia].lng, nodes[ia].lat],
          [nodes[ib].lng, nodes[ib].lat],
        );
        if (d < bestD) {
          bestD = d;
          bestA = ia;
          bestB = ib;
        }
      }
    }
    const key = bestA < bestB ? `${bestA}-${bestB}` : `${bestB}-${bestA}`;
    if (!seen.has(key)) {
      seen.add(key);
      edges.push({ id: edges.length, a: bestA, b: bestB, length: bestD });
    }
  }
}

function buildAdjacency(
  nodes: GraphNode[],
  edges: GraphEdge[],
): AdjacencyEntry[][] {
  const adjacency: AdjacencyEntry[][] = nodes.map(() => []);
  for (const e of edges) {
    adjacency[e.a].push({ to: e.b, edgeId: e.id, length: e.length });
    adjacency[e.b].push({ to: e.a, edgeId: e.id, length: e.length });
  }
  return adjacency;
}

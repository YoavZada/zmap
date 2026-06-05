import type { LngLatTuple } from "zmap";
import { haversineMeters } from "./geo";
import type { Metric, PathResult, RoadNetwork, SettleStep } from "./types";

/**
 * A binary min-heap keyed by a numeric priority. Lazy deletion: a node can be
 * pushed multiple times with decreasing keys; stale pops are skipped by the
 * `visited` check in `dijkstra`.
 */
class MinHeap {
  private ids: number[] = [];
  private keys: number[] = [];

  get size(): number {
    return this.ids.length;
  }

  push(id: number, key: number): void {
    this.ids.push(id);
    this.keys.push(key);
    let i = this.ids.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.keys[parent] <= this.keys[i]) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  pop(): number {
    const topId = this.ids[0];
    const lastId = this.ids.pop()!;
    const lastKey = this.keys.pop()!;
    if (this.ids.length > 0) {
      this.ids[0] = lastId;
      this.keys[0] = lastKey;
      let i = 0;
      const n = this.ids.length;
      for (;;) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;
        if (left < n && this.keys[left] < this.keys[smallest]) smallest = left;
        if (right < n && this.keys[right] < this.keys[smallest]) smallest = right;
        if (smallest === i) break;
        this.swap(i, smallest);
        i = smallest;
      }
    }
    return topId;
  }

  private swap(i: number, j: number): void {
    const ti = this.ids[i];
    this.ids[i] = this.ids[j];
    this.ids[j] = ti;
    const tk = this.keys[i];
    this.keys[i] = this.keys[j];
    this.keys[j] = tk;
  }
}

/**
 * Dijkstra's shortest path from `source` to `target`. The `metric` selects the
 * edge weight: real road length, or a flat 1 per hop ("fewest stops"). The
 * order in which nodes are settled is recorded in `settled` so the UI can
 * animate the search wavefront expanding outward from the source.
 */
export function dijkstra(
  network: RoadNetwork,
  source: number,
  target: number,
  metric: Metric,
): PathResult {
  const n = network.nodes.length;
  const dist = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const visited = new Uint8Array(n);
  const settled: SettleStep[] = [];

  const heap = new MinHeap();
  dist[source] = 0;
  heap.push(source, 0);

  while (heap.size > 0) {
    const u = heap.pop();
    if (visited[u]) continue;
    visited[u] = 1;
    settled.push({ node: u, from: prev[u] });
    if (u === target) break;

    for (const edge of network.adjacency[u]) {
      if (visited[edge.to]) continue;
      const weight = metric === "distance" ? edge.length : 1;
      const candidate = dist[u] + weight;
      if (candidate < dist[edge.to]) {
        dist[edge.to] = candidate;
        prev[edge.to] = u;
        heap.push(edge.to, candidate);
      }
    }
  }

  const exploredCount = settled.length;
  if (!visited[target]) {
    return {
      found: false,
      nodeIds: [],
      coordinates: [],
      lengthMeters: 0,
      segments: 0,
      settled,
      exploredCount,
    };
  }

  const nodeIds: number[] = [];
  for (let at = target; at !== -1; at = prev[at]) nodeIds.push(at);
  nodeIds.reverse();

  const coordinates: LngLatTuple[] = nodeIds.map((id) => [
    network.nodes[id].lng,
    network.nodes[id].lat,
  ]);

  let lengthMeters = 0;
  for (let i = 1; i < coordinates.length; i++) {
    lengthMeters += haversineMeters(coordinates[i - 1], coordinates[i]);
  }

  return {
    found: true,
    nodeIds,
    coordinates,
    lengthMeters,
    segments: Math.max(0, nodeIds.length - 1),
    settled,
    exploredCount,
  };
}

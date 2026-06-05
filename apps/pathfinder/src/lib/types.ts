import type { LngLatTuple } from "zmap";

/** A graph vertex — an "intersection" in the road network. */
export type GraphNode = {
  id: number;
  lng: number;
  lat: number;
};

/** An undirected graph edge — a "road segment" between two intersections. */
export type GraphEdge = {
  id: number;
  a: number;
  b: number;
  /** Segment length in meters (great-circle between the two nodes). */
  length: number;
};

/** A neighbor reachable from a node, used when relaxing edges. */
export type AdjacencyEntry = {
  to: number;
  edgeId: number;
  length: number;
};

/** The full routable network. `adjacency[nodeId]` lists that node's neighbors. */
export type RoadNetwork = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacency: AdjacencyEntry[][];
};

/** What Dijkstra minimizes: total road length, or number of stops (hops). */
export type Metric = "distance" | "stops";

/** One node being settled (popped from the queue), plus the edge used to reach it. */
export type SettleStep = {
  node: number;
  /** Predecessor node id in the shortest-path tree, or -1 for the source. */
  from: number;
};

export type PathResult = {
  found: boolean;
  /** Node ids from start to end (inclusive). Empty when no path exists. */
  nodeIds: number[];
  /** Coordinates along the path, ready to hand to <Route>. */
  coordinates: LngLatTuple[];
  /** Total road length of the path in meters (always real distance). */
  lengthMeters: number;
  /** Number of road segments in the path. */
  segments: number;
  /** Order nodes were settled, for animating the search wavefront. */
  settled: SettleStep[];
  /** How many nodes Dijkstra explored before stopping. */
  exploredCount: number;
};

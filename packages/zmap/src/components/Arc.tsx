import { useMemo, type FC } from "react";
import Route, { type RouteProps } from "./Route";
import { generateArc, type ArcType } from "../utils/arc";
import type { LngLatTuple } from "../utils/geojson";

export interface ArcProps extends Omit<RouteProps, "coordinates"> {
  from: LngLatTuple;
  to: LngLatTuple;
  /** Bulge factor for "bezier" arcs (0 = straight). Default 0.3. */
  curvature?: number;
  /** Number of points sampled along the arc. Default 64. */
  points?: number;
  /** "bezier" (flight-path bulge) or "geodesic" (great-circle). Default bezier. */
  type?: ArcType;
}

/** Draws a curved line between two points (great-circle or bezier). */
const Arc: FC<ArcProps> = ({
  from,
  to,
  curvature,
  points,
  type,
  ...routeProps
}) => {
  const coordinates = useMemo(
    () => generateArc(from, to, { curvature, points, type }),
    // Depend on scalar coords so new array identities don't force recompute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [from[0], from[1], to[0], to[1], curvature, points, type],
  );

  return <Route coordinates={coordinates} {...routeProps} />;
};

export default Arc;

import { useMemo, type FC } from "react";
import { Route } from "zmap";
import type { LngLatTuple } from "zmap";

export type PathLayerProps = {
  coordinates: LngLatTuple[];
  /** Reveal only the first `visible` coordinates (the draw-on animation). */
  visible: number;
};

/** The final shortest path, drawn in the primary color over the search tree. */
const PathLayer: FC<PathLayerProps> = ({ coordinates, visible }) => {
  const revealed = useMemo(
    () => coordinates.slice(0, Math.max(0, visible)),
    [coordinates, visible],
  );

  if (revealed.length < 2) return null;

  return (
    <Route
      id="pf-path"
      coordinates={revealed}
      color="primary.main"
      width={6}
      opacity={0.95}
    />
  );
};

export default PathLayer;

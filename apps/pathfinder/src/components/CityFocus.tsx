import { useEffect, useRef, type FC } from "react";
import { useMap } from "zmap";
import type { LngLatTuple } from "zmap";

export type CityFocusProps = {
  center: LngLatTuple;
  zoom: number;
};

/**
 * Headless child of <Map>: flies the camera to a new city when the selection
 * changes. The very first render is skipped — the initial city is already set
 * as the map's starting view.
 */
const CityFocus: FC<CityFocusProps> = ({ center, zoom }) => {
  const map = useMap();
  const first = useRef(true);

  useEffect(() => {
    if (!map) return;
    if (first.current) {
      first.current = false;
      return;
    }
    map.flyTo({ center, zoom, essential: true });
  }, [map, center, zoom]);

  return null;
};

export default CityFocus;

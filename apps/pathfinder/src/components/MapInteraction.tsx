import { useEffect, useRef, type FC } from "react";
import type { MapMouseEvent } from "maplibre-gl";
import { useMap } from "zmap";
import type { LngLatTuple } from "zmap";

export type MapInteractionProps = {
  onPick: (lngLat: LngLatTuple) => void;
  /** Drives the crosshair cursor; clicks are always captured. */
  active: boolean;
};

/**
 * Headless child of <Map>: turns map clicks into [lng, lat] picks and shows a
 * crosshair cursor while the user is choosing points.
 */
const MapInteraction: FC<MapInteractionProps> = ({ onPick, active }) => {
  const map = useMap();
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!map) return;
    const handleClick = (e: MapMouseEvent) => {
      onPickRef.current([e.lngLat.lng, e.lngLat.lat]);
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    const canvas = map.getCanvas();
    canvas.style.cursor = active ? "crosshair" : "";
    return () => {
      canvas.style.cursor = "";
    };
  }, [map, active]);

  return null;
};

export default MapInteraction;

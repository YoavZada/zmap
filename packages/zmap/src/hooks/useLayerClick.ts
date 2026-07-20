import { useEffect, useRef } from "react";
import type { MapLayerMouseEvent } from "maplibre-gl";
import { useMapContext } from "../context/useMap";

/**
 * Internal: subscribes a click handler to one layer and shows a pointer
 * cursor while hovering it. The handler lives in a ref so subscriptions
 * don't churn on every render.
 */
export function useLayerClick(
  layerId: string,
  handler?: (event: MapLayerMouseEvent) => void,
): void {
  const { map } = useMapContext();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const enabled = handler !== undefined;

  useEffect(() => {
    if (!map || !enabled) return;
    const click = (e: MapLayerMouseEvent) => handlerRef.current?.(e);
    const enter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const leave = () => {
      map.getCanvas().style.cursor = "";
    };
    map.on("click", layerId, click);
    map.on("mouseenter", layerId, enter);
    map.on("mouseleave", layerId, leave);
    return () => {
      map.off("click", layerId, click);
      map.off("mouseenter", layerId, enter);
      map.off("mouseleave", layerId, leave);
    };
  }, [map, layerId, enabled]);
}

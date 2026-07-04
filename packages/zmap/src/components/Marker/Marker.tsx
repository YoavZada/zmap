import { useEffect, useRef, type FC, type ReactNode } from "react";
import { createPortal } from "react-dom";
import maplibregl, { type MarkerOptions, type PointLike } from "maplibre-gl";
import Box from "@mui/material/Box";
import LocationOn from "@mui/icons-material/LocationOn";
import { useMapContext } from "../../context/useMap";
import type { LngLatTuple } from "../../utils/geojson";
import Styles from "./marker.style";

export interface MarkerProps {
  longitude: number;
  latitude: number;
  /** Which part of the marker sits on the coordinate. Set at creation time. */
  anchor?: MarkerOptions["anchor"];
  /** Pixel offset from the anchor point. */
  offset?: PointLike;
  /** Allow the user to drag the marker. */
  draggable?: boolean;
  /** Rotation in degrees. */
  rotation?: number;
  onClick?: (event: MouseEvent) => void;
  onDragEnd?: (lngLat: LngLatTuple) => void;
  /** Custom marker content (any MUI element). Falls back to a themed pin. */
  children?: ReactNode;
}

function DefaultMarkerPin() {
  return (
    <Box sx={Styles.pin}>
      <LocationOn sx={Styles.pinIcon} />
    </Box>
  );
}

/**
 * A map marker that renders arbitrary MUI content via a React portal into a
 * MapLibre marker. With no children it shows a themed pin.
 */
const Marker: FC<MarkerProps> = ({
  longitude,
  latitude,
  anchor,
  offset,
  draggable = false,
  rotation,
  onClick,
  onDragEnd,
  children,
}) => {
  const { map } = useMapContext();
  const elRef = useRef<HTMLDivElement | null>(null);
  if (!elRef.current && typeof document !== "undefined") {
    elRef.current = document.createElement("div");
  }
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const hasChildren = children != null;
  const resolvedAnchor = anchor ?? (hasChildren ? "center" : "bottom");

  // Create once per map instance.
  useEffect(() => {
    const element = elRef.current;
    if (!map || !element) return;

    const marker = new maplibregl.Marker({
      element,
      anchor: resolvedAnchor,
      offset,
      draggable,
      rotation,
    })
      .setLngLat([longitude, latitude])
      .addTo(map);
    markerRef.current = marker;

    const handleClick = (event: MouseEvent) => onClickRef.current?.(event);
    element.addEventListener("click", handleClick);

    const handleDragEnd = () => {
      const { lng, lat } = marker.getLngLat();
      onDragEndRef.current?.([lng, lat]);
    };
    marker.on("dragend", handleDragEnd);

    return () => {
      element.removeEventListener("click", handleClick);
      marker.off("dragend", handleDragEnd);
      marker.remove();
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    markerRef.current?.setLngLat([longitude, latitude]);
  }, [longitude, latitude]);

  useEffect(() => {
    markerRef.current?.setDraggable(draggable);
  }, [draggable]);

  useEffect(() => {
    if (offset) markerRef.current?.setOffset(offset);
  }, [offset]);

  useEffect(() => {
    if (rotation != null) markerRef.current?.setRotation(rotation);
  }, [rotation]);

  if (!elRef.current) return null;
  return createPortal(children ?? <DefaultMarkerPin />, elRef.current);
};

export default Marker;

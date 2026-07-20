import { useEffect, useRef, type FC, type ReactNode } from "react";
import { createPortal } from "react-dom";
import maplibregl, { type MarkerOptions, type PointLike } from "maplibre-gl";
import Box from "@mui/material/Box";
import LocationOn from "@mui/icons-material/LocationOn";
import { useMapContext } from "../../context/useMap";
import type { LngLatTuple } from "../../utils/geojson";
import Styles from "./marker.style";

export interface MarkerProps {
  /** Longitude of the marker position. */
  longitude: number;
  /** Latitude of the marker position. */
  latitude: number;
  /** Which part of the marker sits on the coordinate. Set at creation time. */
  anchor?: MarkerOptions["anchor"];
  /** Pixel offset from the anchor point. */
  offset?: PointLike;
  /** Allow the user to drag the marker. */
  draggable?: boolean;
  /** Rotation in degrees. */
  rotation?: number;
  /**
   * Accessible name for the marker (`aria-label`). Recommended whenever
   * `onClick` is set — interactive markers are keyboard-focusable buttons.
   */
  label?: string;
  /**
   * Click handler. Also makes the marker keyboard-accessible: it becomes
   * focusable with `role="button"`, and Enter/Space activate it.
   */
  onClick?: (event: MouseEvent) => void;
  /** Fired after a drag ends, with the marker's new [lng, lat]. */
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
  label,
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: created once per map; props are mirrored onto the marker via refs + later effects
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

    // Keyboard activation for interactive markers: Enter/Space re-dispatch as
    // a real click, so the click path above stays the single source of truth.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!onClickRef.current) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      element.click();
    };
    element.addEventListener("keydown", handleKeyDown);

    const handleDragEnd = () => {
      const { lng, lat } = marker.getLngLat();
      onDragEndRef.current?.([lng, lat]);
    };
    marker.on("dragend", handleDragEnd);

    return () => {
      element.removeEventListener("click", handleClick);
      element.removeEventListener("keydown", handleKeyDown);
      marker.off("dragend", handleDragEnd);
      marker.remove();
      markerRef.current = null;
    };
  }, [map]);

  // Reflect interactivity onto the element: interactive markers are
  // keyboard-focusable buttons; static ones stay out of the tab order.
  const interactive = onClick != null;
  useEffect(() => {
    const element = elRef.current;
    if (!element) return;
    if (interactive) {
      element.setAttribute("role", "button");
      element.tabIndex = 0;
    } else {
      element.removeAttribute("role");
      element.removeAttribute("tabindex");
    }
    if (label) element.setAttribute("aria-label", label);
    else element.removeAttribute("aria-label");
  }, [interactive, label]);

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

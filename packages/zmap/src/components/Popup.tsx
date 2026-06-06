import { useEffect, useRef, type FC, type ReactNode } from "react";
import { createPortal } from "react-dom";
import maplibregl, { type PopupOptions } from "maplibre-gl";
import { useTheme } from "@mui/material/styles";
import { useMapContext } from "../context/useMap";
import { applyOverlayTheme, injectOverlayStyles } from "../utils/overlayTheme";

export interface PopupProps {
  longitude: number;
  latitude: number;
  /** Controlled visibility. Default true. */
  open?: boolean;
  /** Fired when MapLibre closes the popup (X button, click, or move). */
  onClose?: () => void;
  anchor?: PopupOptions["anchor"];
  offset?: PopupOptions["offset"];
  /** Show the X button. Default true. */
  closeButton?: boolean;
  /** Close when the map is clicked. Default true. */
  closeOnClick?: boolean;
  /** Close when the map moves. Default false. */
  closeOnMove?: boolean;
  maxWidth?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * A theme-aware popup anchored to a coordinate. Renders MUI content via a portal
 * into a MapLibre popup, styled to match the current MUI surface (incl. dark).
 */
const Popup: FC<PopupProps> = ({
  longitude,
  latitude,
  open = true,
  onClose,
  anchor,
  offset,
  closeButton = true,
  closeOnClick = true,
  closeOnMove = false,
  maxWidth = "320px",
  className,
  children,
}) => {
  const { map } = useMapContext();
  const theme = useTheme();

  const contentRef = useRef<HTMLDivElement | null>(null);
  if (!contentRef.current && typeof document !== "undefined") {
    contentRef.current = document.createElement("div");
  }
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    injectOverlayStyles();
  }, []);

  // Create the popup while `open`; tear it down when closed.
  useEffect(() => {
    const content = contentRef.current;
    if (!map || !content || !open) return;

    const popup = new maplibregl.Popup({
      closeButton,
      closeOnClick,
      closeOnMove,
      anchor,
      offset,
      maxWidth,
      className: `zmap-popup${className ? ` ${className}` : ""}`,
    })
      .setLngLat([longitude, latitude])
      .setDOMContent(content)
      .addTo(map);
    popupRef.current = popup;
    applyOverlayTheme(popup.getElement(), theme);

    const handleClose = () => onCloseRef.current?.();
    popup.on("close", handleClose);

    return () => {
      popup.off("close", handleClose);
      popup.remove();
      popupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, open]);

  useEffect(() => {
    popupRef.current?.setLngLat([longitude, latitude]);
  }, [longitude, latitude]);

  useEffect(() => {
    const el = popupRef.current?.getElement();
    if (el) applyOverlayTheme(el, theme);
  }, [theme]);

  if (!contentRef.current || !open) return null;
  return createPortal(children, contentRef.current);
};

export default Popup;

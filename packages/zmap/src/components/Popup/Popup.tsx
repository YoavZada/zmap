import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import { createPortal } from "react-dom";
import maplibregl, { type PopupOptions } from "maplibre-gl";
import { useTheme } from "@mui/material/styles";
import { useMapContext } from "../../context/useMap";
import {
  applyOverlayTheme,
  injectOverlayStyles,
} from "../../utils/overlayTheme";

/** Props for `<Popup>`, a theme-aware popup anchored to a map coordinate. */
export interface PopupProps {
  /** Longitude of the anchor coordinate. */
  longitude: number;
  /** Latitude of the anchor coordinate. */
  latitude: number;
  /** Controlled visibility. Omit to let the popup manage its own open state (see `defaultOpen`). */
  open?: boolean;
  /**
   * Initial visibility when uncontrolled. Default true. Once an uncontrolled
   * popup closes (X button, click, move, or Escape) it stays closed — there's
   * no prop change that reopens it. To reopen, remount the component by
   * changing its React `key`.
   */
  defaultOpen?: boolean;
  /**
   * Fired when MapLibre closes the popup (X button, map click/move, or
   * Escape). In uncontrolled mode the popup also closes itself; in
   * controlled mode, flip `open` to `false` in response.
   */
  onClose?: () => void;
  /** Edge to pin to the coordinate (e.g. "bottom"). Auto-chosen to fit the view when omitted. */
  anchor?: PopupOptions["anchor"];
  /** Pixel offset from the coordinate — a number, [x, y], or a per-anchor map. */
  offset?: PopupOptions["offset"];
  /** Show the X button. Default true. */
  closeButton?: boolean;
  /** Close when the map is clicked. Default true. */
  closeOnClick?: boolean;
  /** Close when the map moves. Default false. */
  closeOnMove?: boolean;
  /** CSS max-width of the popup. Default "320px". */
  maxWidth?: string;
  /** Extra class name(s) for the popup container. */
  className?: string;
  /** Accessible name for the popup dialog. Default "Map popup". */
  ariaLabel?: string;
  /** Content rendered inside the popup. */
  children?: ReactNode;
}

/**
 * A theme-aware popup anchored to a coordinate. Renders MUI content via a portal
 * into a MapLibre popup, styled to match the current MUI surface (incl. dark).
 */
const Popup: FC<PopupProps> = ({
  longitude,
  latitude,
  open,
  defaultOpen,
  onClose,
  anchor,
  offset,
  closeButton = true,
  closeOnClick = true,
  closeOnMove = false,
  maxWidth = "320px",
  className,
  ariaLabel = "Map popup",
  children,
}) => {
  const { map } = useMapContext();
  const theme = useTheme();

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? true);
  const isOpen = open ?? internalOpen;

  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;

  const contentRef = useRef<HTMLDivElement | null>(null);
  if (!contentRef.current && typeof document !== "undefined") {
    contentRef.current = document.createElement("div");
  }
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const classNamesRef = useRef<string[]>([]);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    injectOverlayStyles();
  }, []);

  const optionsKey = JSON.stringify([
    anchor,
    closeButton,
    closeOnClick,
    closeOnMove,
  ]);

  // Create the popup while `isOpen`; tear it down when closed.
  // biome-ignore lint/correctness/useExhaustiveDependencies: recreated on map/isOpen/optionsKey only — anchor/closeButton/closeOnClick/closeOnMove are creation-only and folded into optionsKey; offset/maxWidth/className/position/content sync in later effects
  useEffect(() => {
    const content = contentRef.current;
    if (!map || !content || !isOpen) return;

    // Capture focus before creating the popup: MapLibre's own
    // `focusAfterOpen` (default true) synchronously auto-focuses the first
    // focusable descendant of the popup content — e.g. a button in the
    // consumer's children — as part of `.addTo(map)` below. Left enabled,
    // that races our own focus management and corrupts `previouslyFocused`
    // with a node *inside the popup we're opening* instead of whatever was
    // focused before it opened, so `focus-return` on close lands in the
    // wrong place. Disabled explicitly; we do our own, more deliberate
    // version (focus the whole dialog, restore to `previouslyFocused` after).
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // The classNames the constructor below is about to apply — sync the ref
    // so the className-diff effect (which only adds/removes tokens beyond
    // this initial set) doesn't redundantly re-apply them.
    classNamesRef.current = className
      ? className.split(/\s+/).filter(Boolean)
      : [];

    const popup = new maplibregl.Popup({
      closeButton,
      closeOnClick,
      closeOnMove,
      focusAfterOpen: false,
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

    // a11y: the portaled content is a non-modal dialog.
    content.setAttribute("role", "dialog");
    content.setAttribute("aria-modal", "false");
    content.setAttribute("aria-label", ariaLabel);
    content.tabIndex = -1;

    // Move focus into the popup once it's mounted.
    content.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        popupRef.current?.remove(); // fires "close" → onClose
      }
    };
    content.addEventListener("keydown", onKeyDown);

    const handleClose = () => {
      onCloseRef.current?.();
      if (!isControlledRef.current) setInternalOpen(false);
    };
    popup.on("close", handleClose);

    return () => {
      content.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
      popup.off("close", handleClose);
      popup.remove();
      popupRef.current = null;
    };
  }, [map, isOpen, optionsKey]);

  useEffect(() => {
    popupRef.current?.setLngLat([longitude, latitude]);
  }, [longitude, latitude]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: offset is re-applied via its JSON key (offset can be an object/array, so it's compared by value, not identity)
  useEffect(() => {
    popupRef.current?.setOffset(offset);
  }, [JSON.stringify(offset ?? null)]);

  useEffect(() => {
    popupRef.current?.setMaxWidth(maxWidth);
  }, [maxWidth]);

  useEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;
    const next = className ? className.split(/\s+/).filter(Boolean) : [];
    const prev = classNamesRef.current;
    for (const name of prev) {
      if (!next.includes(name)) popup.removeClassName(name);
    }
    for (const name of next) {
      if (!prev.includes(name)) popup.addClassName(name);
    }
    classNamesRef.current = next;
  }, [className]);

  useEffect(() => {
    const el = popupRef.current?.getElement();
    if (el) applyOverlayTheme(el, theme);
  }, [theme]);

  useEffect(() => {
    contentRef.current?.setAttribute("aria-label", ariaLabel);
  }, [ariaLabel]);

  if (!contentRef.current || !isOpen) return null;
  return createPortal(children, contentRef.current);
};

export default Popup;

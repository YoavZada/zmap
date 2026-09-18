import { createContext } from "react";

/**
 * The map's root element, for portaled overlays that must stay inside the map
 * (fullscreen). `null` until the map mounts.
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

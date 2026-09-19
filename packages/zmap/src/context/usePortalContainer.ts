import { useContext } from "react";
import { PortalContainerContext } from "./PortalContainerContext";

/**
 * The map container element — pass it as MUI `container` /
 * `slotProps.popper.container` so your own menus and tooltips survive
 * fullscreen. `null` outside `<Map>` or before mount.
 */
export function usePortalContainer(): HTMLElement | null {
  return useContext(PortalContainerContext);
}

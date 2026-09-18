import type { FC } from "react";
import Tooltip, { type TooltipProps } from "@mui/material/Tooltip";
import { usePortalContainer } from "../../context/usePortalContainer";

/** Props for `<ControlTooltip>` — identical to MUI's `Tooltip`. */
export type ControlTooltipProps = TooltipProps;

/**
 * A drop-in replacement for MUI `Tooltip`, used by the built-in map controls.
 * MUI portals its Popper into `document.body` by default, which lies outside
 * the map's fullscreen element — so a tooltip would vanish while a control is
 * shown fullscreen. This wires the Popper's `container` to the map's root
 * element (via `usePortalContainer`) so it stays visible. The map root has
 * `overflow: hidden`, so the Popper also switches to the `fixed` strategy —
 * fixed-position boxes escape ancestor overflow clipping while staying DOM
 * children of the fullscreen element. Private to the built-in controls — not
 * part of the public API.
 */
const ControlTooltip: FC<ControlTooltipProps> = ({ slotProps, ...props }) => {
  const container = usePortalContainer();
  const popperSlotProps = slotProps?.popper;

  return (
    <Tooltip
      {...props}
      slotProps={{
        ...slotProps,
        popper: (ownerState) => {
          const resolved =
            typeof popperSlotProps === "function"
              ? popperSlotProps(ownerState)
              : popperSlotProps;
          return {
            ...resolved,
            container,
            popperOptions: {
              ...resolved?.popperOptions,
              strategy: "fixed",
            },
          };
        },
      }}
    />
  );
};

export default ControlTooltip;

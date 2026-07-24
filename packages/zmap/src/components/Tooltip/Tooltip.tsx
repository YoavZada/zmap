import type { FC } from "react";
import Box from "@mui/material/Box";
import Popup, { type PopupProps } from "../Popup";

/** Props for `<Tooltip>`, a lightweight non-interactive label anchored to a map coordinate. */
export type TooltipProps = Omit<PopupProps, "closeButton" | "closeOnClick">;

/**
 * A lightweight, non-interactive label anchored to a coordinate — a Popup with
 * no close button and tighter padding. Pair it with a Marker's hover state.
 */
const Tooltip: FC<TooltipProps> = ({
  className,
  children,
  offset,
  ...rest
}) => {
  return (
    <Popup
      {...rest}
      offset={offset ?? 12}
      closeButton={false}
      closeOnClick={false}
      className={`zmap-popup--tooltip${className ? ` ${className}` : ""}`}
    >
      <Box role="tooltip">{children}</Box>
    </Popup>
  );
};

export default Tooltip;

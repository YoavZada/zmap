import { forwardRef, type CSSProperties, type ReactNode } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Styles from "./mapLoader.style";

/** Configures the built-in `<Map>` loading indicator (see `Map`'s `loaderProps`). */
export type MapLoaderProps = {
  /**
   * Which loader form to render: `"overlay"` is a frosted full-map screen
   * (default), `"spinner"` is a bare centered icon over the basemap, and
   * `"bar"` is a slim progress bar pinned to the top edge.
   * @default "overlay"
   */
  variant?: "overlay" | "spinner" | "bar";
  /** Optional text shown with the indicator (under the spinner, or beneath the bar). */
  label?: ReactNode;
  /**
   * Controlled progress from 0 to 100. When provided the indicator is
   * determinate; omit it for the default indeterminate animation.
   */
  progress?: number;
  /**
   * Spinner diameter in pixels (`"overlay"` / `"spinner"` variants only).
   * @default 40
   */
  size?: number;
};

// Internal-only props: MUI `Fade` (used by `Map`) drives the cross-fade by
// cloning this element with a transition `style` and a `ref`, so the root must
// forward both. These stay off the public `MapLoaderProps` surface.
type Props = MapLoaderProps & {
  style?: CSSProperties;
  className?: string;
};

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/** Default themed loading indicator shown while `<Map>` initializes. */
const MapLoader = forwardRef<HTMLDivElement, Props>(function MapLoader(
  { variant = "overlay", label, progress, size = 40, style, className },
  ref,
) {
  const determinate = typeof progress === "number";
  const value = determinate ? clamp(progress) : undefined;
  const name = typeof label === "string" ? label : "Loading map";

  const rootProps = {
    ref,
    style,
    className,
    role: "status" as const,
    "aria-live": "polite" as const,
    "aria-label": name,
  };

  if (variant === "bar") {
    return (
      <Box {...rootProps} sx={Styles.container.bar}>
        <LinearProgress
          variant={determinate ? "determinate" : "indeterminate"}
          value={value}
        />
        {label != null && (
          <Typography variant="caption" sx={Styles.barLabel}>
            {label}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box {...rootProps} sx={Styles.container[variant]}>
      <Box sx={Styles.content}>
        <CircularProgress
          size={size}
          variant={determinate ? "determinate" : "indeterminate"}
          value={value}
        />
        {label != null && (
          <Typography variant="body2" sx={Styles.label}>
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  );
});

export default MapLoader;

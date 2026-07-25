import type { FC, ReactNode } from "react";
import { useTheme } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { resolvePaletteColor } from "../../utils/color";
import type { ChoroplethSpec } from "../../utils/choropleth";
import type { ControlPosition } from "../MapControls";
import Styles from "./legend.style";

/** A single categorical legend row: swatch color + label. */
export type LegendItem = {
  /** Swatch color — an MUI palette token ("primary.main") or any CSS color. */
  color: string;
  /** Row label. */
  label: ReactNode;
};

/** Props for `<Legend>`, a themed map legend. */
export type LegendProps = {
  /** Optional heading shown above the legend body. */
  title?: ReactNode;
  /** Corner to anchor the legend. Default "bottom-right". */
  position?: ControlPosition;
  /**
   * Drive the legend from the same `ChoroplethSpec` a `ShapeLayer` fill takes,
   * so the legend and its layer share one source of truth. "interpolate"
   * (default) renders a continuous gradient ramp; "step" renders banded swatches.
   */
  spec?: ChoroplethSpec;
  /**
   * Discrete swatches for a categorical legend. Takes precedence over `spec`.
   */
  items?: LegendItem[];
  /** Format numeric stop values shown on a `spec`-driven legend. */
  formatValue?: (value: number) => string;
};

type ResolvedStop = { value: number; color: string };

function SwatchList({ items }: { items: LegendItem[] }) {
  return (
    <Box sx={Styles.list}>
      {items.map((item, i) => (
        <Box key={i} sx={Styles.itemRow}>
          <Box sx={Styles.swatch(item.color)} />
          <Typography variant="caption" sx={Styles.itemLabel}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function GradientRamp({
  stops,
  format,
}: {
  stops: ResolvedStop[];
  format: (value: number) => string;
}) {
  const min = stops[0].value;
  const max = stops[stops.length - 1].value;
  const span = max - min || 1;
  const pct = (value: number) => ((value - min) / span) * 100;
  const gradient = `linear-gradient(to right, ${stops
    .map((s) => `${s.color} ${pct(s.value)}%`)
    .join(", ")})`;

  return (
    <Box>
      <Box sx={Styles.gradientBar(gradient)} />
      <Box sx={Styles.ticks}>
        {stops.map((s, i) => (
          <Typography key={i} variant="caption" sx={Styles.tick}>
            {format(s.value)}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

// Turn step stops into banded ranges: the first color applies below the second
// stop's value, the last applies at or above the last stop, and the rest cover
// the half-open interval up to the next stop — matching buildColorExpression's
// "step" semantics.
function stepBands(
  stops: ResolvedStop[],
  format: (value: number) => string,
): LegendItem[] {
  return stops.map((s, i) => {
    let label: string;
    if (i === 0) label = `< ${format(stops[1]?.value ?? s.value)}`;
    else if (i === stops.length - 1) label = `≥ ${format(s.value)}`;
    else label = `${format(s.value)} – ${format(stops[i + 1].value)}`;
    return { color: s.color, label };
  });
}

function titleText(t: ReactNode): string {
  return typeof t === "string" ? t : "";
}

/**
 * A themed map legend. Because it is plain MUI it inherits the app's theme
 * (light/dark, palette, shape) automatically. Pass the same `ChoroplethSpec`
 * your `ShapeLayer` uses to keep the legend in sync with the layer, or an
 * `items` list for a categorical legend.
 */
const Legend: FC<LegendProps> = ({
  title,
  position = "bottom-right",
  spec,
  items,
  formatValue = (value) => String(value),
}) => {
  const theme = useTheme();

  let body: ReactNode = null;

  if (items && items.length > 0) {
    body = (
      <SwatchList
        items={items.map((item) => ({
          ...item,
          color: resolvePaletteColor(theme, item.color),
        }))}
      />
    );
  } else if (spec && spec.stops.length > 0) {
    const stops: ResolvedStop[] = spec.stops.map(([value, color]) => ({
      value,
      color: resolvePaletteColor(theme, color),
    }));
    body =
      spec.type === "step" ? (
        <SwatchList items={stepBands(stops, formatValue)} />
      ) : (
        <GradientRamp stops={stops} format={formatValue} />
      );
  }

  if (!body) return null;

  const a11yLabel =
    items && items.length > 0
      ? `${title ? `${titleText(title)}: ` : ""}legend, ${items.length} categories`
      : spec && spec.stops.length > 0
        ? `${title ? `${titleText(title)}: ` : ""}color scale from ${formatValue(
            spec.stops[0][0],
          )} to ${formatValue(spec.stops[spec.stops.length - 1][0])}`
        : "legend";

  return (
    <Paper
      elevation={3}
      sx={Styles.panel(position)}
      role="img"
      aria-label={a11yLabel}
    >
      {title != null && (
        <Typography variant="caption" component="div" sx={Styles.title}>
          {title}
        </Typography>
      )}
      {body}
    </Paper>
  );
};

export default Legend;

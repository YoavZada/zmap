import { useId, useMemo, type ElementType, type FC } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import StraightenOutlined from "@mui/icons-material/StraightenOutlined";
import SquareFootOutlined from "@mui/icons-material/SquareFootOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { useDraw } from "../../hooks/useDraw";
import { useLocale, useLocaleText } from "../../context/useLocaleText";
import {
  formatArea,
  formatDistance,
  lineDistance,
  localeUnitLabels,
  polygonArea,
  type MeasureUnit,
} from "../../utils/measure";
import type { LngLatTuple } from "../../utils/geojson";
import ControlTooltip from "../ControlTooltip";
import type { ControlPosition } from "../MapControls";
import DrawLayers from "../DrawLayers";
import KeyboardCrosshair from "../KeyboardCrosshair";
import Styles from "./measureControl.style";

/** Which measurement tool is active: distance ("line") or area ("polygon"). */
export type MeasureMode = "line" | "polygon";

/** Props for `<MeasureControl>`, a measuring tape for line distance and polygon area. */
export type MeasureControlProps = {
  /** Corner for the tool palette. Default "top-left". */
  position?: ControlPosition;
  /** Corner for the measurement readout chips. Default "top-right". */
  readoutPosition?: ControlPosition;
  /** Tools to offer. Default distance (line) + area (polygon). */
  modes?: MeasureMode[];
  /** Unit system for the readouts. Default "metric". */
  unit?: MeasureUnit;
  /** Palette token or CSS color for the drawn measurements. */
  color?: string;
};

const MODE_ICONS: Record<MeasureMode, ElementType> = {
  line: StraightenOutlined,
  polygon: SquareFootOutlined,
};

type Readout = { icon: ElementType; text: string };

/**
 * A measuring tape: draw a line to read its length, or a polygon to read its
 * area. Values surface live (while drawing) and per-shape in deletable MUI
 * chips. Built on the same engine as <DrawControl>.
 */
const MeasureControl: FC<MeasureControlProps> = ({
  position = "top-left",
  readoutPosition = "top-right",
  modes = ["line", "polygon"],
  unit = "metric",
  color = "secondary.main",
}) => {
  const t = useLocaleText();
  const locale = useLocale();
  const units = useMemo(() => localeUnitLabels(t), [t]);
  const modeLabel: Record<MeasureMode, string> = {
    line: t.measureDistance,
    polygon: t.measureArea,
  };
  const reactId = useId();
  const idPrefix = `zmap-measure-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { mode, setMode, features, draft, cursor, isDrawing, clear, remove } =
    useDraw({ modes });

  const completed = useMemo(
    () =>
      features.flatMap<Readout & { id: string }>((f) => {
        if (f.geometry.type === "LineString") {
          const meters = lineDistance(f.geometry.coordinates as LngLatTuple[]);
          return [
            {
              id: f.properties.id,
              icon: StraightenOutlined,
              text: formatDistance(meters, unit, { locale, units }),
            },
          ];
        }
        if (f.geometry.type === "Polygon") {
          const ring = (f.geometry.coordinates[0] as LngLatTuple[]).slice(
            0,
            -1,
          );
          return [
            {
              id: f.properties.id,
              icon: SquareFootOutlined,
              text: formatArea(polygonArea(ring), unit, { locale, units }),
            },
          ];
        }
        return [];
      }),
    [features, unit, locale, units],
  );

  const live = useMemo<Readout | null>(() => {
    if (!isDrawing || !cursor) return null;
    const path: LngLatTuple[] = [...draft, cursor];
    if (mode === "line") {
      return {
        icon: StraightenOutlined,
        text: formatDistance(lineDistance(path), unit, { locale, units }),
      };
    }
    if (mode === "polygon" && path.length >= 3) {
      return {
        icon: SquareFootOutlined,
        text: formatArea(polygonArea(path), unit, { locale, units }),
      };
    }
    return null;
  }, [isDrawing, cursor, draft, mode, unit, locale, units]);

  const hasContent = features.length > 0 || draft.length > 0;

  return (
    <>
      <Paper elevation={3} sx={Styles.panel(position)}>
        <Stack direction="column" divider={<Divider flexItem />}>
          <Stack direction="column" divider={<Divider flexItem />}>
            {modes.map((m) => {
              const Icon = MODE_ICONS[m];
              const label = modeLabel[m];
              const active = mode === m;
              return (
                <ControlTooltip key={m} title={label} placement="right">
                  <IconButton
                    size="small"
                    onClick={() => setMode(active ? null : m)}
                    sx={Styles.toolButton(active)}
                    aria-label={label}
                    aria-pressed={active}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                </ControlTooltip>
              );
            })}
          </Stack>

          {hasContent && (
            <ControlTooltip title={t.clearMeasurements} placement="right">
              <IconButton
                size="small"
                onClick={clear}
                aria-label={t.clearMeasurements}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </ControlTooltip>
          )}
        </Stack>
      </Paper>

      {(completed.length > 0 || live) && (
        <Box sx={Styles.readout(readoutPosition)}>
          {completed.map(({ id, icon: Icon, text }) => (
            <Chip
              key={id}
              size="small"
              variant="outlined"
              icon={<Icon fontSize="small" />}
              label={text}
              onDelete={() => remove(id)}
            />
          ))}
          {live && (
            <Chip
              size="small"
              color="primary"
              icon={<live.icon fontSize="small" />}
              label={live.text}
            />
          )}
        </Box>
      )}

      <DrawLayers
        features={features}
        draft={draft}
        cursor={cursor}
        mode={mode}
        idPrefix={idPrefix}
        color={color}
      />

      {mode != null && <KeyboardCrosshair />}
    </>
  );
};

export default MeasureControl;

import { useId, type ElementType, type FC } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import TimelineOutlined from "@mui/icons-material/TimelineOutlined";
import PentagonOutlined from "@mui/icons-material/PentagonOutlined";
import Check from "@mui/icons-material/Check";
import Undo from "@mui/icons-material/Undo";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { useDraw, type DrawFeature, type DrawMode } from "../../hooks/useDraw";
import { useLocaleText } from "../../context/useLocaleText";
import ControlTooltip from "../ControlTooltip";
import type { ControlPosition } from "../MapControls";
import DrawLayers from "../DrawLayers";
import KeyboardCrosshair from "../KeyboardCrosshair";
import Styles from "./drawControl.style";

/** Props for `<DrawControl>`, a drawing palette for point/line/polygon shapes. */
export type DrawControlProps = {
  /** Corner for the tool palette. Default "top-left". */
  position?: ControlPosition;
  /** Which drawing tools to offer. Default point + line + polygon. */
  modes?: DrawMode[];
  /** Palette token or CSS color for the drawn shapes. Default "primary.main". */
  color?: string;
  /** Fill opacity for drawn polygons, 0–1. Default 0.3. */
  fillOpacity?: number;
  /** Width of drawn lines and outlines in pixels. Default 2. */
  lineWidth?: number;
  /** Show the "clear all" button. Default true. */
  showClear?: boolean;
  /** Fired with the full feature list on every add / undo / clear. */
  onChange?: (features: DrawFeature[]) => void;
  /** Fired once when a single shape is completed. */
  onCreate?: (feature: DrawFeature) => void;
};

const MODE_ICONS: Record<DrawMode, ElementType> = {
  point: PlaceOutlined,
  line: TimelineOutlined,
  polygon: PentagonOutlined,
};

/**
 * A drawing palette: pick point / line / polygon, then click the map to add
 * vertices (double-click or Enter to finish, Backspace to undo, Esc to cancel).
 * Completed shapes render through <ShapeLayer> / <PointLayer> and are emitted
 * via onChange / onCreate as plain GeoJSON.
 */
const DrawControl: FC<DrawControlProps> = ({
  position = "top-left",
  modes = ["point", "line", "polygon"],
  color = "primary.main",
  fillOpacity = 0.3,
  lineWidth = 2,
  showClear = true,
  onChange,
  onCreate,
}) => {
  const t = useLocaleText();
  const modeLabel: Record<DrawMode, string> = {
    point: t.drawPoint,
    line: t.drawLine,
    polygon: t.drawPolygon,
  };
  const reactId = useId();
  const idPrefix = `zmap-draw-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const {
    mode,
    setMode,
    features,
    draft,
    cursor,
    isDrawing,
    finish,
    undo,
    clear,
  } = useDraw({ modes, onChange, onCreate });

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

          {isDrawing && (
            <Stack direction="column" divider={<Divider flexItem />}>
              <ControlTooltip title={t.finishShape} placement="right">
                <IconButton
                  size="small"
                  onClick={finish}
                  aria-label={t.finishShape}
                >
                  <Check fontSize="small" />
                </IconButton>
              </ControlTooltip>
              <ControlTooltip title={t.undoLastPoint} placement="right">
                <IconButton
                  size="small"
                  onClick={undo}
                  aria-label={t.undoLastPoint}
                >
                  <Undo fontSize="small" />
                </IconButton>
              </ControlTooltip>
            </Stack>
          )}

          {showClear && hasContent && (
            <ControlTooltip title={t.clearAll} placement="right">
              <IconButton size="small" onClick={clear} aria-label={t.clearAll}>
                <DeleteOutline fontSize="small" />
              </IconButton>
            </ControlTooltip>
          )}
        </Stack>
      </Paper>

      <DrawLayers
        features={features}
        draft={draft}
        cursor={cursor}
        mode={mode}
        idPrefix={idPrefix}
        color={color}
        fillOpacity={fillOpacity}
        lineWidth={lineWidth}
      />

      {mode != null && <KeyboardCrosshair />}
    </>
  );
};

export default DrawControl;

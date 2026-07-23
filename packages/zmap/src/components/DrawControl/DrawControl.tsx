import { useId, type ElementType, type FC } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import TimelineOutlined from "@mui/icons-material/TimelineOutlined";
import PentagonOutlined from "@mui/icons-material/PentagonOutlined";
import Check from "@mui/icons-material/Check";
import Undo from "@mui/icons-material/Undo";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { useDraw, type DrawFeature, type DrawMode } from "../../hooks/useDraw";
import type { ControlPosition } from "../MapControls";
import DrawLayers from "../DrawLayers";
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

const MODE_META: Record<DrawMode, { icon: ElementType; label: string }> = {
  point: { icon: PlaceOutlined, label: "Draw point" },
  line: { icon: TimelineOutlined, label: "Draw line" },
  polygon: { icon: PentagonOutlined, label: "Draw polygon" },
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
              const { icon: Icon, label } = MODE_META[m];
              const active = mode === m;
              return (
                <Tooltip key={m} title={label} placement="right">
                  <IconButton
                    size="small"
                    onClick={() => setMode(active ? null : m)}
                    sx={Styles.toolButton(active)}
                    aria-label={label}
                    aria-pressed={active}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                </Tooltip>
              );
            })}
          </Stack>

          {isDrawing && (
            <Stack direction="column" divider={<Divider flexItem />}>
              <Tooltip title="Finish shape" placement="right">
                <IconButton
                  size="small"
                  onClick={finish}
                  aria-label="Finish shape"
                >
                  <Check fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Undo last point" placement="right">
                <IconButton
                  size="small"
                  onClick={undo}
                  aria-label="Undo last point"
                >
                  <Undo fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}

          {showClear && hasContent && (
            <Tooltip title="Clear all" placement="right">
              <IconButton size="small" onClick={clear} aria-label="Clear all">
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Tooltip>
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
    </>
  );
};

export default DrawControl;

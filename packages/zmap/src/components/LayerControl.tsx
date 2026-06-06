import { useMemo, useState, type FC, type ReactNode } from "react";
import { useTheme, type SxProps, type Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper, { type PaperProps } from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Checkbox, { type CheckboxProps } from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import LayersIcon from "@mui/icons-material/LayersOutlined";
import Close from "@mui/icons-material/Close";
import { useLayerRegistry } from "../context/useLayerRegistry";
import type { LayerEntry } from "../context/LayerRegistryContext";
import { resolvePaletteColor } from "../utils/color";
import type { ControlPosition } from "./MapControls";
import Layer from "./Layer";
import Styles from "./layerControl.style";

/** A fully-controlled layer definition for the `layers` config API. */
export type LayerConfig = {
  id: string;
  label: string;
  color?: string;
  icon?: ReactNode;
  group?: string;
  defaultVisible?: boolean;
  /** The map content for this layer (shown/hidden with the checkbox). */
  render?: () => ReactNode;
};

/** Handle passed to `renderItem` for a custom row. */
export interface LayerItemControls {
  checked: boolean;
  /** Toggle (no arg) or set visibility. */
  toggle: (visible?: boolean) => void;
}

export type LayerControlProps = {
  position?: ControlPosition;
  /** Start with the panel expanded. Default false (just the icon button). */
  defaultOpen?: boolean;
  title?: string;
  /** Optional config-driven layers, in addition to any declarative <Layer>s. */
  layers?: LayerConfig[];
  /** Icon for the trigger button + header. Default a layers icon. */
  icon?: ReactNode;
  /** Icon for the collapse button. Default a close (×) icon. */
  collapseIcon?: ReactNode;
  /** Panel width in px. */
  width?: number;
  /** Tint each checkbox with its layer `color`. Default uses the theme primary. */
  colorCheckbox?: boolean;
  /** Fully render a row yourself (icon, badges, actions, …). */
  renderItem?: (entry: LayerEntry, controls: LayerItemControls) => ReactNode;
  /** Replace the collapsed trigger button entirely. */
  renderTrigger?: (open: () => void) => ReactNode;
  /** sx applied to the expanded panel (Paper). */
  sx?: SxProps<Theme>;
  /** Props forwarded to the inner MUI Paper / Checkbox. */
  slotProps?: { paper?: PaperProps; checkbox?: CheckboxProps };
};

const toArr = (s?: SxProps<Theme>): SxProps<Theme>[] =>
  s ? (Array.isArray(s) ? s : [s]) : [];

/**
 * A collapsible MUI panel that lists registered overlay layers as checkboxes and
 * toggles their visibility. Layers come from declarative <Layer> children and/or
 * the `layers` config prop — both feed the same registry. Heavily customizable
 * via icons, slot props, and `renderItem` / `renderTrigger` render props.
 */
const LayerControl: FC<LayerControlProps> = ({
  position = "top-right",
  defaultOpen = false,
  title = "Layers",
  layers,
  icon,
  collapseIcon,
  width,
  colorCheckbox = false,
  renderItem,
  renderTrigger,
  sx,
  slotProps,
}) => {
  const theme = useTheme();
  const { entries, setVisible } = useLayerRegistry();
  const [open, setOpen] = useState(defaultOpen);

  const triggerIcon = icon ?? <LayersIcon fontSize="small" />;
  const paperProps = slotProps?.paper;
  const checkboxProps = slotProps?.checkbox;

  // Group entries by `group`, preserving registration order.
  const groups = useMemo(() => {
    const map = new Map<string, LayerEntry[]>();
    for (const e of entries) {
      const key = e.group ?? "";
      const list = map.get(key);
      if (list) list.push(e);
      else map.set(key, [e]);
    }
    return [...map.entries()];
  }, [entries]);

  const hasGroups = groups.some(([g]) => g !== "");

  const renderRow = (e: LayerEntry) => {
    if (renderItem) {
      return (
        <Box key={e.id}>
          {renderItem(e, {
            checked: e.visible,
            toggle: (v) => setVisible(e.id, v ?? !e.visible),
          })}
        </Box>
      );
    }
    return (
      <FormControlLabel
        key={e.id}
        sx={Styles.row}
        control={
          <Checkbox
            size="small"
            checked={e.visible}
            onChange={(ev) => setVisible(e.id, ev.target.checked)}
            sx={
              colorCheckbox && e.color
                ? Styles.checkboxColor(resolvePaletteColor(theme, e.color))
                : undefined
            }
            {...checkboxProps}
          />
        }
        label={
          <Box sx={Styles.labelRow}>
            {e.icon ? (
              <Box sx={Styles.icon}>{e.icon}</Box>
            ) : e.color ? (
              <Box sx={Styles.swatch(resolvePaletteColor(theme, e.color))} />
            ) : null}
            <Typography variant="body2">{e.label}</Typography>
          </Box>
        }
      />
    );
  };

  return (
    <>
      {/* Config-driven layers register + render their content via <Layer>. */}
      {layers?.map((c) => (
        <Layer
          key={c.id}
          id={c.id}
          label={c.label}
          color={c.color}
          icon={c.icon}
          group={c.group}
          defaultVisible={c.defaultVisible}
        >
          {c.render?.()}
        </Layer>
      ))}

      <Box sx={Styles.root(position)}>
        {open ? (
          <Paper
            elevation={3}
            {...paperProps}
            sx={
              [
                Styles.panel,
                width != null && Styles.panelWidth(width),
                ...toArr(sx),
                ...toArr(paperProps?.sx),
              ] as unknown as SxProps<Theme>
            }
          >
            <Box sx={Styles.header}>
              <Box sx={Styles.icon}>{triggerIcon}</Box>
              <Typography variant="subtitle2" sx={Styles.headerTitle}>
                {title}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setOpen(false)}
                aria-label="Collapse layers"
              >
                {collapseIcon ?? <Close fontSize="small" />}
              </IconButton>
            </Box>
            <Box sx={Styles.list}>
              {entries.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No layers
                </Typography>
              )}
              {groups.map(([group, list]) => (
                <Box key={group || "_"}>
                  {hasGroups && group !== "" && (
                    <Typography variant="overline" sx={Styles.groupHeading}>
                      {group}
                    </Typography>
                  )}
                  {list.map(renderRow)}
                </Box>
              ))}
            </Box>
          </Paper>
        ) : renderTrigger ? (
          renderTrigger(() => setOpen(true))
        ) : (
          <Paper elevation={3} sx={Styles.panel}>
            <Tooltip title={title} placement="left">
              <IconButton
                size="small"
                onClick={() => setOpen(true)}
                aria-label="Show layers"
              >
                {triggerIcon}
              </IconButton>
            </Tooltip>
          </Paper>
        )}
      </Box>
    </>
  );
};

export default LayerControl;

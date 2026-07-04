import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import CenterFocusStrong from "@mui/icons-material/CenterFocusStrongOutlined";
import ContentCopy from "@mui/icons-material/ContentCopyOutlined";
import PushPin from "@mui/icons-material/PushPinOutlined";
import type { Map as MapLibreMap, MapMouseEvent } from "maplibre-gl";
import { useMapContext } from "../context/useMap";
import type { LngLatTuple } from "../utils/geojson";
import Marker from "./Marker";
import Styles from "./contextMenu.style";

export type ContextMenuItemContext = {
  /** The coordinate the menu was opened at. */
  lngLat: LngLatTuple;
  /** The underlying MapLibre map. */
  map: MapLibreMap;
};

export type ContextMenuItem = {
  label: ReactNode;
  icon?: ReactNode;
  onClick?: (ctx: ContextMenuItemContext) => void;
  /** Render a divider after this item. */
  divider?: boolean;
  disabled?: boolean;
};

export type ContextMenuProps = {
  /**
   * Menu entries — a static array or a builder called with the click
   * coordinate. When omitted, the built-in center / copy / drop items show.
   */
  items?: ContextMenuItem[] | ((lngLat: LngLatTuple) => ContextMenuItem[]);
  /**
   * Include the built-in items. Defaults to true when `items` is omitted and
   * false when custom items are supplied (set true to append the defaults).
   */
  defaultItems?: boolean;
  /** Decimal places for the copied / displayed coordinate. Default 5. */
  precision?: number;
  /**
   * Handle the built-in "Drop marker" action. When omitted, the menu drops and
   * renders its own draggable markers (click one to remove it).
   */
  onDropMarker?: (lngLat: LngLatTuple) => void;
};

type AnchorState = { lngLat: LngLatTuple; x: number; y: number };
type DroppedMarker = { id: number; lngLat: LngLatTuple };

/**
 * A theme-aware right-click menu anchored to a map coordinate. Ships with
 * center-here / copy-coordinates / drop-marker actions, or pass your own
 * `items`. Because it's a plain MUI <Menu>, it inherits the app theme.
 */
const ContextMenu: FC<ContextMenuProps> = ({
  items,
  defaultItems,
  precision = 5,
  onDropMarker,
}) => {
  const { map } = useMapContext();
  const [anchor, setAnchor] = useState<AnchorState | null>(null);
  const [markers, setMarkers] = useState<DroppedMarker[]>([]);
  const [snack, setSnack] = useState<string | null>(null);
  const markerId = useRef(0);

  useEffect(() => {
    if (!map) return;
    const onCtx = (e: MapMouseEvent) => {
      e.preventDefault();
      setAnchor({
        lngLat: [e.lngLat.lng, e.lngLat.lat],
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
      });
    };
    map.on("contextmenu", onCtx);
    return () => {
      map.off("contextmenu", onCtx);
    };
  }, [map]);

  const close = () => setAnchor(null);

  const defaults: ContextMenuItem[] = [
    {
      label: "Center here",
      icon: <CenterFocusStrong fontSize="small" />,
      onClick: ({ lngLat, map: m }) => m.easeTo({ center: lngLat }),
    },
    {
      label: "Copy coordinates",
      icon: <ContentCopy fontSize="small" />,
      onClick: ({ lngLat }) => {
        const text = `${lngLat[1].toFixed(precision)}, ${lngLat[0].toFixed(precision)}`;
        void navigator.clipboard?.writeText(text);
        setSnack(`Copied ${text}`);
      },
    },
    {
      label: "Drop marker",
      icon: <PushPin fontSize="small" />,
      onClick: ({ lngLat }) => {
        if (onDropMarker) onDropMarker(lngLat);
        else
          setMarkers((prev) => [
            ...prev,
            { id: (markerId.current += 1), lngLat },
          ]);
      },
    },
  ];

  const custom =
    typeof items === "function" ? (anchor ? items(anchor.lngLat) : []) : items;
  const includeDefaults = defaultItems ?? custom == null;
  const list: ContextMenuItem[] = [
    ...(custom ?? []),
    ...(includeDefaults ? defaults : []),
  ];

  const handle = (item: ContextMenuItem) => {
    if (anchor && map) item.onClick?.({ lngLat: anchor.lngLat, map });
    close();
  };

  return (
    <>
      <Menu
        open={anchor != null}
        onClose={close}
        anchorReference="anchorPosition"
        anchorPosition={anchor ? { top: anchor.y, left: anchor.x } : undefined}
      >
        {list.flatMap((item, i) => {
          const node = (
            <MenuItem
              key={`item-${i}`}
              disabled={item.disabled}
              onClick={() => handle(item)}
            >
              {item.icon && (
                <ListItemIcon sx={Styles.listIcon}>{item.icon}</ListItemIcon>
              )}
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          );
          return item.divider ? [node, <Divider key={`div-${i}`} />] : [node];
        })}
      </Menu>

      {markers.map((m) => (
        <Marker
          key={m.id}
          longitude={m.lngLat[0]}
          latitude={m.lngLat[1]}
          draggable
          onClick={() =>
            setMarkers((prev) => prev.filter((x) => x.id !== m.id))
          }
          onDragEnd={(lngLat) =>
            setMarkers((prev) =>
              prev.map((x) => (x.id === m.id ? { ...x, lngLat } : x)),
            )
          }
        />
      ))}

      <Snackbar
        open={snack != null}
        autoHideDuration={1600}
        onClose={() => setSnack(null)}
        message={snack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

export default ContextMenu;

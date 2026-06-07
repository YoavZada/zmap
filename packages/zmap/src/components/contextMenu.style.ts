import type { SxProps, Theme } from "@mui/material/styles";

// Tighten the default ListItemIcon gutter so the menu reads compact.
const listIcon: SxProps<Theme> = { minWidth: 32 };

const styles: Record<"listIcon", SxProps<Theme>> = { listIcon };

export default styles;

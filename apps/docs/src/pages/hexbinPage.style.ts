import type { SxProps, Theme } from "@mui/material/styles";

const intro: SxProps<Theme> = { mb: 3, maxWidth: 760 };

const map: SxProps<Theme> = { height: 480, borderRadius: 2 };

const styles: Record<"intro" | "map", SxProps<Theme>> = { intro, map };

export default styles;

import type { SxProps, Theme } from "@mui/material/styles";

const pin: SxProps<Theme> = {
  color: "primary.main",
  display: "flex",
  cursor: "pointer",
  lineHeight: 0,
  filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.4))",
};

const pinIcon: SxProps<Theme> = {
  fontSize: 36,
};

const styles: Record<"pin" | "pinIcon", SxProps<Theme>> = { pin, pinIcon };
export default styles;

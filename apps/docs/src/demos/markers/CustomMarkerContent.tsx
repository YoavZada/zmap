import type { FC } from "react";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { Map, Marker } from "zmapgl";

const CustomMarkerContent: FC = () => {
  return (
    <Map center={[1, 50]} zoom={4} sx={{ height: 380, borderRadius: 2 }}>
      <Marker longitude={2.3522} latitude={48.8566} anchor="center">
        <Chip
          icon={<RestaurantIcon />}
          label="Le Jules Verne"
          color="primary"
        />
      </Marker>

      <Marker longitude={-0.1276} latitude={51.5072} anchor="center">
        <Avatar
          sx={{
            // Fixed (not theme-derived) colors: secondary.main/dark's
            // auto-picked contrast text falls short of WCAG AA (4.5:1) in one
            // mode or the other (light: 4.32:1, dark: 3.7:1). This pair holds
            // ~8.75:1 against white in both themes.
            bgcolor: "#8a1c5c",
            color: "#fff",
            border: "2px solid white",
            width: 44,
            height: 44,
            fontSize: 14,
          }}
        >
          LDN
        </Avatar>
      </Marker>
    </Map>
  );
};

export default CustomMarkerContent;

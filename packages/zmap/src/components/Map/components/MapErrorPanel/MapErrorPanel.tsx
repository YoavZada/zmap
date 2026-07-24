import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MapOutlined from "@mui/icons-material/MapOutlined";
import Styles from "./mapErrorPanel.style";

type Props = {
  error: Error;
};

/** Default themed fallback shown when the map fails to initialize. */
const MapErrorPanel: FC<Props> = ({ error }) => (
  <Box role="alert" sx={Styles.root}>
    <MapOutlined fontSize="large" />
    <Typography variant="body2">Unable to load the map</Typography>
    {import.meta.env?.DEV && (
      <Typography variant="caption">{error.message}</Typography>
    )}
  </Box>
);

export default MapErrorPanel;

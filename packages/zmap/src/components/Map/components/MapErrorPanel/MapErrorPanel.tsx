import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MapOutlined from "@mui/icons-material/MapOutlined";
import { useLocaleText } from "../../../../context/useLocaleText";
import Styles from "./mapErrorPanel.style";

type Props = {
  error: Error;
};

/** Default themed fallback shown when the map fails to initialize. */
const MapErrorPanel: FC<Props> = ({ error }) => {
  const t = useLocaleText();
  return (
    <Box role="alert" sx={Styles.root}>
      <MapOutlined fontSize="large" />
      <Typography variant="body2">{t.mapLoadError}</Typography>
      {import.meta.env?.DEV && (
        <Typography variant="caption">{error.message}</Typography>
      )}
    </Box>
  );
};

export default MapErrorPanel;

import type { FC } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ExploreOutlined from "@mui/icons-material/ExploreOutlined";
import { Map, Marker } from "zmapgl";
import Styles from "./notFoundPage.style";

const NotFoundPage: FC = () => {
  return (
    <Box sx={Styles.root}>
      <Typography variant="h3">Off the map</Typography>
      <Typography color="text.secondary" sx={Styles.lead}>
        This page doesn't exist. The marker below is at Null Island — which is
        roughly where that URL points.
      </Typography>
      <Button
        variant="contained"
        component={RouterLink}
        to="/"
        startIcon={<ExploreOutlined />}
      >
        Back to introduction
      </Button>
      <Paper variant="outlined" sx={Styles.mapCard}>
        <Map
          center={[0, 0]}
          zoom={2}
          interactive={false}
          hideAttribution
          sx={Styles.map}
        >
          <Marker longitude={0} latitude={0} />
        </Map>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;

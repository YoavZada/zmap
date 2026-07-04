import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DemoSection from "../components/DemoSection";
import PropsTable from "../components/PropsTable";
import ConfigurableControls from "../demos/controls/ConfigurableControls";
import configurableControlsSource from "../demos/controls/ConfigurableControls.tsx?raw";
import Styles from "./controlsPage.style";

export const ControlsPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Controls
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        <code>MapControls</code> is a cluster of MUI buttons — zoom, compass
        (drag to rotate, then click to reset north), geolocate, and fullscreen —
        plus an optional scale bar. Because it's plain MUI, it inherits your
        theme automatically.
      </Typography>

      <DemoSection
        title="Configurable controls"
        description="Toggle individual controls and reposition the cluster. Drag with right-click to rotate, then use the compass."
        code={configurableControlsSource}
        demo={<ConfigurableControls />}
      />
      <PropsTable component="MapControls" />
    </Box>
  );
};

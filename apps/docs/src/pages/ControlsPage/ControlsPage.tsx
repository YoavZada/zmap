import type { FC } from "react";
import Box from "@mui/material/Box";
import DemoSection from "../../components/DemoSection";
import PageHeader from "../../components/PageHeader";
import PropsTable from "../../components/PropsTable";
import ConfigurableControls from "../../demos/controls/ConfigurableControls";
import configurableControlsSource from "../../demos/controls/ConfigurableControls.tsx?raw";

const ControlsPage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Controls"
        lead={
          <>
            <code>MapControls</code> is a cluster of MUI buttons — zoom, compass
            (drag to rotate, then click to reset north), geolocate, and
            fullscreen — plus an optional scale bar. Because it's plain MUI, it
            inherits your theme automatically.
          </>
        }
      />

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

export default ControlsPage;

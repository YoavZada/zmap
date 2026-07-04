import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DemoSection from "../components/DemoSection";
import PropsTable from "../components/PropsTable";
import ClickPopups from "../demos/popups/ClickPopups";
import clickPopupsSource from "../demos/popups/ClickPopups.tsx?raw";
import HoverTooltips from "../demos/popups/HoverTooltips";
import hoverTooltipsSource from "../demos/popups/HoverTooltips.tsx?raw";
import Styles from "./popupsPage.style";

export const PopupsPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Popups & Tooltips
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        Popups and tooltips render MUI content into a MapLibre overlay, styled
        to match your theme's surface — including dark mode and rounded corners.
        A <code>Tooltip</code> is a non-interactive popup with no close button.
      </Typography>

      <DemoSection
        title="Click-to-open popups"
        description="Drive visibility with controlled open state; onClose fires when the user dismisses it."
        code={clickPopupsSource}
        demo={<ClickPopups />}
      />

      <DemoSection
        title="Hover tooltips"
        description="Combine a Marker's hover state with a Tooltip for lightweight labels."
        code={hoverTooltipsSource}
        demo={<HoverTooltips />}
      />
      <PropsTable component="Popup" />
      <PropsTable component="Tooltip" />
    </Box>
  );
};

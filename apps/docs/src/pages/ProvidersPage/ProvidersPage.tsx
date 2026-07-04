import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DemoSection from "../../components/DemoSection";
import PropsTable from "../../components/PropsTable";
import ProviderSwitcher from "../../demos/providers/ProviderSwitcher";
import providerSwitcherSource from "../../demos/providers/ProviderSwitcher.tsx?raw";
import Styles from "./providersPage.style";

const ProvidersPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Providers & Theming
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        Switch basemap providers with a single prop. CARTO, OpenStreetMap, and
        VersaTiles are built in and need no API key; anything
        MapLibre-compatible also works via a style URL, spec, or a custom{" "}
        <code>MapProvider</code>. With <code>colorScheme="auto"</code> the
        basemap tracks the MUI theme — toggle the app theme (top-right) to see
        it.
      </Typography>

      <DemoSection
        title="Live provider switcher"
        description="CARTO and VersaTiles swap light ↔ dark with the theme. OpenStreetMap uses a single raster style."
        code={providerSwitcherSource}
        demo={<ProviderSwitcher />}
      />
      <PropsTable
        component="Map"
        note="Also accepts every MUI Box prop (sx, height, className, …) — the map container is a Box."
      />
    </Box>
  );
};

export default ProvidersPage;

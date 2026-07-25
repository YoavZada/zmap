import type { FC } from "react";
import Box from "@mui/material/Box";
import DemoSection from "../../components/DemoSection";
import PageHeader from "../../components/PageHeader";
import PropsTable from "../../components/PropsTable";
import LoaderDemo from "../../demos/providers/LoaderDemo";
import loaderDemoSource from "../../demos/providers/LoaderDemo.tsx?raw";
import ProviderSwitcher from "../../demos/providers/ProviderSwitcher";
import providerSwitcherSource from "../../demos/providers/ProviderSwitcher.tsx?raw";

const ProvidersPage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Providers & Theming"
        lead={
          <>
            Switch basemap providers with a single prop. CARTO, OpenStreetMap,
            and VersaTiles are built in and need no API key; anything
            MapLibre-compatible also works via a style URL, spec, or a custom{" "}
            <code>MapProvider</code>. With <code>colorScheme="auto"</code> the
            basemap tracks the MUI theme — toggle the app theme (top-right) to
            see it.
          </>
        }
      />

      <DemoSection
        title="Live provider switcher"
        description="CARTO and VersaTiles swap light ↔ dark with the theme. OpenStreetMap uses a single raster style."
        code={providerSwitcherSource}
        demo={<ProviderSwitcher />}
      />
      <DemoSection
        title="Loading indicator"
        description="Opt in with the loader prop (off by default); loaderProps picks the form — a frosted overlay, a bare spinner, or a slim top bar. Hit Replay to watch it again."
        code={loaderDemoSource}
        demo={<LoaderDemo />}
      />
      <PropsTable
        component="Map"
        note="Also accepts every MUI Box prop (sx, height, className, …) — the map container is a Box."
      />
    </Box>
  );
};

export default ProvidersPage;

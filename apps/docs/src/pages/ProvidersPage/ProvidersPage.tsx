import type { FC } from "react";
import Box from "@mui/material/Box";
import CodeBlock from "../../components/CodeBlock";
import DemoSection from "../../components/DemoSection";
import PageHeader from "../../components/PageHeader";
import PropsTable from "../../components/PropsTable";
import LoaderDemo from "../../demos/providers/LoaderDemo";
import loaderDemoSource from "../../demos/providers/LoaderDemo.tsx?raw";
import ProviderSwitcher from "../../demos/providers/ProviderSwitcher";
import providerSwitcherSource from "../../demos/providers/ProviderSwitcher.tsx?raw";
import { ARCGIS_KEY } from "../../env";

const ARCGIS_SNIPPET = `import { Map, arcgis } from "zmapgl";

// Defaults to arcgis/light-gray, paired with arcgis/dark-gray in dark mode.
<Map provider={arcgis(import.meta.env.VITE_ARCGIS_KEY)} />

// Any Basemap Styles v2 style, plus label language / worldview / places.
<Map provider={arcgis(key, "arcgis/streets", { language: "fr" })} />

// Styles without a dark twin reuse themselves — or pick your own pair.
<Map provider={arcgis(key, { light: "arcgis/topographic", dark: "arcgis/nova" })} />`;

const ProvidersPage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Providers & Theming"
        lead={
          <>
            Switch basemap providers with a single prop. CARTO, OpenStreetMap,
            VersaTiles and OpenTopoMap are built in and need no API key;
            MapTiler and Esri ArcGIS are one factory call with your key; and
            anything MapLibre-compatible also works via a style URL, spec, or a
            custom <code>MapProvider</code>. With{" "}
            <code>colorScheme="auto"</code> the basemap tracks the MUI theme —
            toggle the app theme (top-right) to see it.
          </>
        }
      />

      <DemoSection
        title="Live provider switcher"
        description="CARTO, VersaTiles and ArcGIS swap light ↔ dark with the theme (ArcGIS pairs e.g. light-gray with dark-gray automatically). OpenStreetMap and OpenTopoMap use a single raster style."
        code={providerSwitcherSource}
        demo={<ProviderSwitcher />}
      >
        <CodeBlock
          code={ARCGIS_SNIPPET}
          filename="ArcGisMap.tsx"
          note={
            ARCGIS_KEY
              ? "Free keys at developers.arcgis.com. Lock yours to your domains by HTTP referrer."
              : "Free keys at developers.arcgis.com. This site shows the live ArcGIS toggle when VITE_ARCGIS_KEY is set at build time."
          }
        />
      </DemoSection>
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

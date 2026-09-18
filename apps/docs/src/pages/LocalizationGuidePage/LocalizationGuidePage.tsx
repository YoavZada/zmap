import type { FC } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import CodeBlock from "../../components/CodeBlock";
import DemoSection from "../../components/DemoSection";
import PageHeader from "../../components/PageHeader";
import HebrewMapDemo from "../../demos/i18n/HebrewMapDemo";
import hebrewMapDemoSource from "../../demos/i18n/HebrewMapDemo.tsx?raw";
import Styles from "./localizationGuidePage.style";

const localeTextCode = `import { Map, enUS, heIL } from "zmapgl";

<Map localeText={heIL} />   {/* every built-in string: tooltips, aria-labels, menu items, legend text */}

// Partial override — anything you omit falls back to enUS
<Map localeText={{ mapLabel: "Store finder", zoomIn: "Zoom in" }} />

// Read the merged strings in your own components
import { useLocaleText } from "zmapgl";

const t = useLocaleText();
<Button aria-label={t.myLocationLabel}>{t.myLocation}</Button>`;

const numberLocaleCode = `<Map
  locale={{ "AttributionControl.ToggleAttribution": "Attribution basculante" }}   // MapLibre's own control strings
  localeText={heIL}                                                              // zmapgl's own strings
  numberLocale="he-IL"                                                           // number formatting only
/>`;

const formatCode = `import { formatDistance, formatArea, localeUnitLabels, useLocaleText } from "zmapgl";

const t = useLocaleText();

formatDistance(1500);                                        // "1.50 km"
formatDistance(1500, "imperial");                             // "0.93 mi"
formatDistance(1500, "metric", { locale: "he-IL" });           // grouping/decimal separator follow he-IL
formatDistance(1500, "metric", { units: localeUnitLabels(t) }); // unit labels follow the active localeText

formatArea(12000);                              // "12,000 m²" → "0.01 km²" past 1,000,000 m²
formatArea(12000, "imperial", { maximumFractionDigits: 1 });`;

const rtlPluginCode = `// Default: on when the nearest MUI theme has direction: "rtl" — evaluated
// once, when the map is created.
<Map />

// Force it on/off regardless of theme, or point at your own mirror:
<Map rtlTextPlugin />
<Map rtlTextPlugin={false} />
<Map rtlTextPlugin="https://cdn.example.com/mapbox-gl-rtl-text.js" />

// An app that mounts LTR and only later flips its theme to RTL should pass
// rtlTextPlugin explicitly (the plugin is page-global and evaluated at
// creation) — or call the loader yourself, e.g. eagerly at app start:
import { registerRtlTextPlugin } from "zmapgl";

registerRtlTextPlugin(); // idempotent — safe to call more than once`;

const muiRtlCode = `// 1. Tell MUI the app is RTL:
const theme = createTheme({ direction: "rtl" });

// 2. Mirror physical CSS your OWN app writes (margin-left, text-align, …) —
//    zmap's controls already use logical properties and don't need this,
//    but the rest of an MUI RTL app does. See MUI's RTL guide:
//    https://mui.com/material-ui/customization/right-to-left/
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

const cacheRtl = createCache({ key: "muirtl", stylisPlugins: [prefixer, rtlPlugin] });

// 3. Set dir="rtl" on <html> (or any ancestor of <Map>) — this is what
//    actually mirrors zmap's own controls (they read the computed CSS
//    direction, not theme.direction alone):
<html dir="rtl">`;

const LocalizationGuidePage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Localization & RTL"
        lead="Translate every string zmapgl renders, format numbers to a locale, and mirror controls for right-to-left layouts."
      />

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          localeText
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Every user-visible zmapgl string — tooltips, aria-labels, menu items,
          legend text, the transport bar — comes from <code>localeText</code>.
          Pass a ship-ready locale (<code>enUS</code>, <code>heIL</code>) or
          override just the keys you care about; the rest falls back to{" "}
          <code>enUS</code>.
        </Typography>
        <CodeBlock code={localeTextCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          numberLocale vs. locale
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          These three props sound similar but do different jobs:{" "}
          <code>locale</code> overrides MapLibre's own built-in UI strings (its
          attribution toggle, cooperative-gesture hint); <code>localeText</code>{" "}
          overrides zmapgl's own strings; and <code>numberLocale</code> is a
          BCP-47 tag that only affects number formatting — the scale bar and{" "}
          <code>MeasureControl</code>'s readouts. It defaults to the browser
          locale, independent of either string override.
        </Typography>
        <CodeBlock code={numberLocaleCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Formatting distances and areas yourself
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          The same formatters the scale bar and <code>MeasureControl</code> use
          are exported directly — reach for them in your own UI instead of
          re-deriving unit thresholds:
        </Typography>
        <CodeBlock code={formatCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          rtlTextPlugin
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Hebrew/Arabic basemap labels need MapLibre's RTL text plugin to shape
          and order correctly. It's on by default whenever the nearest MUI theme
          has <code>direction: "rtl"</code>, loaded lazily and once per page —
          the check happens at map creation time.
        </Typography>
        <CodeBlock code={rtlPluginCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Mirroring controls: dir="rtl" and MUI's own RTL setup
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          zmap's floating controls (<code>MapControls</code>,{" "}
          <code>ContextMenu</code>, tooltips, …) use logical{" "}
          <code>insetInlineStart</code>/<code>insetInlineEnd</code> instead of
          physical <code>left</code>/<code>right</code>, so they mirror off the
          element's computed CSS direction automatically — no zmap-side config
          needed. That direction comes from the <code>dir</code> attribute (on{" "}
          <code>&lt;html&gt;</code> or any ancestor of <code>&lt;Map&gt;</code>
          ), not from <code>theme.direction</code> alone: an MUI theme set to
          RTL without a matching <code>dir</code> attribute won't flip zmap's
          controls. This is a v0.10 behavior change — under{" "}
          <code>dir="rtl"</code>, <code>top-left</code> now renders on the
          visual right, matching what an RTL layout expects.
        </Typography>
        <CodeBlock code={muiRtlCode} />
      </Box>

      <DemoSection
        title="A full Hebrew example"
        description={
          <>
            Theme direction, <code>dir="rtl"</code>, <code>localeText</code>,
            and <code>numberLocale</code> together — toggle the app theme
            (top-right) to see the basemap follow light/dark independently of
            the RTL layout.
          </>
        }
        demo={<HebrewMapDemo />}
        code={hebrewMapDemoSource}
      />

      <Box sx={Styles.section}>
        <Typography color="text.secondary" sx={Styles.trailingNote}>
          For accessibility conventions beyond translation — focus management,
          keyboard interaction, the axe CI gate — see the{" "}
          <Link component={RouterLink} to="/guides/accessibility">
            Accessibility guide
          </Link>
          .
        </Typography>
      </Box>
    </Box>
  );
};

export default LocalizationGuidePage;

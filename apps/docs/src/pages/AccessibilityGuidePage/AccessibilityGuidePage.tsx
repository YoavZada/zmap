import type { FC } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import CodeBlock from "../../components/CodeBlock";
import PageHeader from "../../components/PageHeader";
import Styles from "./accessibilityGuidePage.style";

const shipped = [
  <>
    The map's root is an accessible <code>role="region"</code> with a name from{" "}
    <code>localeText.mapLabel</code>.
  </>,
  <>
    <code>Popup</code>/<code>Tooltip</code> are a labeled dialog: opening moves
    focus in, <kbd>Escape</kbd> closes and returns focus to whatever was focused
    before.
  </>,
  <>
    Every control button — zoom, compass, geolocate, fullscreen, tilt, the
    draw/measure/select tools, the layer toggle — ships a tooltip and an{" "}
    <code>aria-label</code>, both sourced from <code>localeText</code>.
  </>,
  <>
    The map canvas is natively keyboard-navigable (MapLibre's built-in keyboard
    handler: arrow keys pan, +/- zoom). <code>DrawControl</code> and{" "}
    <code>SelectControl</code> add <kbd>Space</kbd> to place a point / mark a
    box corner and <kbd>Escape</kbd> to cancel, with a live-region hint (
    <code>selectKeyboardHint</code>) announcing box-select progress.
  </>,
  <>
    <code>prefers-reduced-motion: reduce</code> removes the built-in
    loader/fallback panel's fade transition — it appears/disappears instantly
    instead of animating.
  </>,
  <>
    CI scans every docs route, light and dark, with{" "}
    <code>@axe-core/playwright</code> and fails the build on any
    serious/critical violation.
  </>,
];

const mapLabelCode = `<Map localeText={{ mapLabel: "Store locations near you" }} />`;

const popupAriaCode = `<Popup longitude={lng} latitude={lat} ariaLabel="Camden store details">
  <StoreCard store={store} />
</Popup>`;

const markerNameCode = `// Marker content is arbitrary MUI — a bare pin has no accessible name.
// Give an interactive marker one the way you would any icon button:
<Marker longitude={lng} latitude={lat}>
  <IconButton aria-label={\`\${store.name} store\`} size="small">
    <StoreIcon />
  </IconButton>
</Marker>`;

const AccessibilityGuidePage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Accessibility"
        lead="What zmapgl handles for you, what's still yours to get right, and how the CI gate that catches regressions works."
      />

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          What ships
        </Typography>
        <Box component="ul" sx={Styles.list}>
          {shipped.map((item, i) => (
            // Static list, order never changes — index is a stable key.
            <Typography key={i} component="li" color="text.secondary">
              {item}
            </Typography>
          ))}
        </Box>
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Translating every aria-label
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Every string zmapgl renders — including every aria-label above — comes
          from <code>localeText</code>: override any subset, or hand it a full
          ship-ready locale (<code>enUS</code>, <code>heIL</code>). See the{" "}
          <Link component={RouterLink} to="/guides/i18n">
            Localization &amp; RTL guide
          </Link>{" "}
          for the full picture, including number/measurement formatting and RTL
          control mirroring.
        </Typography>
        <CodeBlock code={mapLabelCode} />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          What's on you
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Anything zmapgl can't infer from your data is yours to label. Give an
          interactive marker an accessible name — its content is arbitrary MUI,
          so a bare pin has none by default:
        </Typography>
        <CodeBlock code={markerNameCode} />
        <Typography color="text.secondary" sx={Styles.trailingNote}>
          Pass <code>ariaLabel</code> on a <code>Popup</code> when its purpose
          isn't obvious from an anchor alone:
        </Typography>
        <CodeBlock code={popupAriaCode} />
        <Typography color="text.secondary" sx={Styles.trailingNote}>
          And check contrast for any custom color. Palette-token colors (
          <code>fillColor="primary.main"</code>) resolve against your theme, but
          a custom hex/CSS color on a layer's fill/stroke or a marker icon is
          yours to verify against the basemap and surrounding chrome in{" "}
          <strong>both</strong> light and dark — the automatic basemap swap
          doesn't guarantee your own data's colors keep their contrast in both
          modes.
        </Typography>
      </Box>
    </Box>
  );
};

export default AccessibilityGuidePage;

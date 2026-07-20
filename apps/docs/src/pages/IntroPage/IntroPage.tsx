import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import PaletteIcon from "@mui/icons-material/PaletteOutlined";
import SpeedIcon from "@mui/icons-material/SpeedOutlined";
import CodeIcon from "@mui/icons-material/CodeOutlined";
import ExtensionIcon from "@mui/icons-material/ExtensionOutlined";
import CheckCircle from "@mui/icons-material/CheckCircle";
import ArrowForward from "@mui/icons-material/ArrowForward";
import TerminalIcon from "@mui/icons-material/Terminal";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Check from "@mui/icons-material/Check";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import OpenInNew from "@mui/icons-material/OpenInNew";
import { Link as RouterLink } from "react-router-dom";
import { Map, Marker } from "zmapgl";
import CodeBlock from "../../components/CodeBlock";
import { PATHFINDER_URL } from "../../env";
import Styles from "./introPage.style";

// Bento spans: the two "headline" features get the wide tiles, the grid
// zigzags 7/5 then 5/7 so the section reads composed rather than templated.
const features = [
  {
    icon: <PaletteIcon />,
    title: "Theme-aware",
    body: "Components read your MUI theme directly — primary palette, shape and light/dark mode flow straight into the controls, popups and basemap.",
    span: 7,
  },
  {
    icon: <SpeedIcon />,
    title: "Hardware-accelerated",
    body: "Built on MapLibre GL for GPU vector rendering. Markers mount through React portals, so React state changes never re-create the map canvas.",
    span: 5,
  },
  {
    icon: <CodeIcon />,
    title: "Declarative",
    body: "Manage the map in JSX. Markers, popups, routes, arcs, clusters and layers are first-class React components with ordinary props and children.",
    span: 5,
  },
  {
    icon: <ExtensionIcon />,
    title: "Pluggable providers",
    body: "CARTO and OpenStreetMap ship built in — or pass any MapLibre style URL or spec. Drop down to the raw map instance whenever you need it.",
    span: 7,
  },
];

const checks = ["Light & dark mode", "TypeScript-first", "MIT licensed"];

const installCode = `npm install zmapgl @mui/material @mui/icons-material \\
  @emotion/react @emotion/styled maplibre-gl`;

const quickStart = `import type { FC } from "react";
import { Map, MapControls, Marker } from "zmapgl";

const MyMap: FC = () => {
  return (
    <Map center={[-0.1276, 51.5072]} zoom={11} sx={{ height: 420 }}>
      <MapControls position="top-right" />
      <Marker longitude={-0.1276} latitude={51.5072} />
    </Map>
  );
};

export default MyMap;`;

const InstallButton: FC = () => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText("npm install zmapgl");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button
      onClick={copy}
      startIcon={<TerminalIcon fontSize="small" />}
      endIcon={
        copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />
      }
      sx={Styles.installButton}
    >
      npm install zmapgl
    </Button>
  );
};

// Two real maps, one forced light and one forced dark — the library's headline
// feature (`colorScheme`) demonstrated literally, side by side.
const ThemeShowcase: FC = () => {
  const view = { center: [-0.118, 51.509] as [number, number], zoom: 10.5 };
  const half = (scheme: "light" | "dark", label: string) => (
    <Box sx={Styles.showcaseHalf}>
      <Map
        colorScheme={scheme}
        center={view.center}
        zoom={view.zoom}
        interactive={false}
        hideAttribution
        sx={Styles.showcaseMap}
      >
        <Marker longitude={view.center[0]} latitude={view.center[1]} />
      </Map>
      <Box component="span" sx={Styles.showcaseLabel}>
        {label}
      </Box>
    </Box>
  );
  return (
    <Paper variant="outlined" sx={Styles.showcase}>
      {half("light", "Light theme")}
      {half("dark", "Dark theme")}
    </Paper>
  );
};

const IntroPage: FC = () => {
  return (
    <Box>
      {/* Hero — full-bleed band with a faint dot grid and one soft glow. */}
      <Box sx={Styles.heroBleed}>
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          alignItems="center"
          sx={Styles.heroInner}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h1" gutterBottom>
              Beautiful maps for{" "}
              <Box component="span" sx={Styles.accent}>
                MUI apps
              </Box>
              .
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={Styles.heroLead}
            >
              zmap inherits your Material UI theme, giving you a unified design
              system from your buttons to your base maps. No custom styling
              hacks — just declarative, composable mapping components.
            </Typography>
            <Stack
              direction="row"
              spacing={1.5}
              sx={Styles.heroActions}
              flexWrap="wrap"
              useFlexGap
            >
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                component={RouterLink}
                to="/markers"
              >
                Explore Components
              </Button>
              <Button variant="outlined" component={RouterLink} to="/blocks">
                Browse blocks
              </Button>
              <InstallButton />
            </Stack>
            <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap>
              {checks.map((c) => (
                <Stack
                  key={c}
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                >
                  <CheckCircle sx={Styles.checkIcon} />
                  <Typography variant="body2" color="text.secondary">
                    {c}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ThemeShowcase />
          </Grid>
        </Grid>
      </Box>

      {/* Feature bento */}
      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Built for the Modern Developer
        </Typography>
        <Typography color="text.secondary" sx={Styles.featureLead}>
          Composable mapping components that feel like the MUI primitives you
          already use.
        </Typography>
        <Grid container spacing={2.5}>
          {features.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: f.span }}>
              <Paper variant="outlined" sx={Styles.featureCard}>
                <Box sx={Styles.featureIcon}>{f.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {f.body}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Pathfinder showcase */}
      <Box sx={Styles.section}>
        <Paper variant="outlined" sx={Styles.pathfinderTile}>
          <Box sx={Styles.pathfinderIcon}>
            <RouteOutlined fontSize="large" />
          </Box>
          <Box sx={Styles.pathfinderText}>
            <Typography variant="overline" color="text.secondary">
              Showcase
            </Typography>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Pathfinder
            </Typography>
            <Typography variant="body2" color="text.secondary">
              An interactive Dijkstra shortest-path demo over a generated road
              network — routes, markers, and controls, all built with zmap
              components.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            endIcon={<OpenInNew fontSize="small" />}
            component="a"
            href={PATHFINDER_URL}
            target="_blank"
            rel="noopener"
          >
            Open Pathfinder
          </Button>
        </Paper>
      </Box>

      {/* Installation */}
      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Installation
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Install zmap alongside its MUI and MapLibre peers. The MapLibre
          stylesheet is bundled automatically — no extra CSS import required.
        </Typography>
        <CodeBlock code={installCode} language="bash" filename="Terminal" />
      </Box>

      {/* Quick start */}
      <Box id="quick-start" sx={Styles.quickStart}>
        <Typography variant="h4" gutterBottom>
          Quick start
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Wrap your app in an MUI <code>ThemeProvider</code>, then compose a
          map. The basemap follows the theme automatically.
        </Typography>
        <CodeBlock
          code={quickStart}
          filename="MyMap.tsx"
          note="Ensure @mui/material is installed and an MUI ThemeProvider wraps your app."
        />
      </Box>
    </Box>
  );
};

export default IntroPage;

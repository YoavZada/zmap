import { useState, type FC, type ReactNode } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Link from "@mui/material/Link";
import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import GitHub from "@mui/icons-material/GitHub";
import MenuIcon from "@mui/icons-material/Menu";
import BoltOutlined from "@mui/icons-material/BoltOutlined";
import { NpmIcon } from "../../icons";
import RouteMeta from "../../components/RouteMeta";
import Search from "../../components/Search";
import { componentGroups, destinations, isComponentRoute } from "../../nav";
import { useColorMode } from "../../theme";
import Footer from "../Footer";
import ApiToc from "./components/ApiToc";
import Styles from "./layout.style";

// Library version, injected from packages/zmap/package.json at build time
// (see vite.config.ts). The release workflow keeps the package version and the
// git tag in lockstep, so this reflects the published GitHub release.
const ZMAP_VERSION = import.meta.env.VITE_ZMAP_VERSION ?? "dev";
const RELEASE_URL = `https://github.com/YoavZada/zmap/releases/tag/v${ZMAP_VERSION}`;
const NPM_URL = "https://www.npmjs.com/package/zmapgl";

type NavProps = { onNavigate?: () => void };

// The grouped component reference — the contextual rail on component/guide
// routes, and the lower half of the mobile drawer.
const ComponentNav: FC<NavProps> = ({ onNavigate }) => {
  const { pathname } = useLocation();
  return (
    <Box sx={Styles.navList}>
      {componentGroups.map((group) => (
        <Box key={group.label}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={Styles.groupHeader}
          >
            {group.label}
          </Typography>
          {group.items.map((item) => {
            const Icon = item.icon;
            const selected = pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                selected={selected}
                onClick={onNavigate}
                sx={Styles.navItem}
                data-testid={`nav-item-${item.path.replace(/\//g, "")}`}
              >
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: { fontSize: 14, fontWeight: selected ? 700 : 500 },
                  }}
                />
              </ListItemButton>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

// The destination tabs as a list — mobile drawer only (they're a top bar on
// desktop).
const DestinationsNav: FC<NavProps> = ({ onNavigate }) => {
  const { pathname } = useLocation();
  return (
    <Box sx={Styles.navList}>
      {destinations.map((d) => {
        const active = d.isActive(pathname);
        return (
          <ListItemButton
            key={d.to}
            component={RouterLink}
            to={d.to}
            selected={active}
            onClick={onNavigate}
            sx={Styles.navItem}
          >
            <ListItemText
              primary={d.label}
              slotProps={{
                primary: { fontSize: 14, fontWeight: active ? 700 : 600 },
              }}
            />
          </ListItemButton>
        );
      })}
    </Box>
  );
};

export type LayoutProps = { children: ReactNode };

const Layout: FC<LayoutProps> = ({ children }) => {
  const { mode, toggle } = useColorMode();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  const showComponentRail = isComponentRoute(pathname);
  const showApiRail = pathname === "/api";
  const hasRail = showComponentRail || showApiRail;
  const isLanding = pathname === "/";

  return (
    <Box sx={Styles.root}>
      <RouteMeta />
      <AppBar position="fixed" color="default" elevation={0} sx={Styles.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen((o) => !o)}
            sx={Styles.menuButton}
            aria-label="Open navigation"
            data-testid="mobile-menu"
          >
            <MenuIcon />
          </IconButton>

          <Box sx={Styles.brandGroup}>
            <Box component={RouterLink} to="/" sx={Styles.brand}>
              <BoltOutlined color="primary" />
              <Typography variant="h6" fontWeight={800} sx={Styles.title}>
                zmap
              </Typography>
            </Box>
            <Tooltip title="Release notes on GitHub">
              <Link
                href={RELEASE_URL}
                target="_blank"
                rel="noopener"
                underline="none"
                sx={Styles.version}
              >
                v{ZMAP_VERSION}
              </Link>
            </Tooltip>
          </Box>

          {/* Absolutely centered so the side clusters can't push them around. */}
          <Box sx={Styles.navTabs}>
            {destinations.map((d) => (
              <Button
                key={d.to}
                component={RouterLink}
                to={d.to}
                disableRipple
                sx={Styles.navTab(d.isActive(pathname))}
                data-testid={`nav-tab-${d.to.replace(/\//g, "") || "home"}`}
              >
                {d.label}
              </Button>
            ))}
          </Box>

          <Box sx={Styles.spacer} />

          <Search variant="field" />

          <Box sx={Styles.actions}>
            <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
              <IconButton
                onClick={toggle}
                color="inherit"
                data-testid="theme-toggle"
              >
                {mode === "dark" ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
            <Tooltip title="npm">
              <IconButton
                color="inherit"
                component="a"
                href={NPM_URL}
                target="_blank"
                rel="noopener"
                sx={Styles.npmAction}
              >
                <NpmIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="GitHub">
              <IconButton
                color="inherit"
                component="a"
                href="https://github.com/YoavZada/zmap"
                target="_blank"
                rel="noopener"
              >
                <GitHub />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop contextual rail — component groups, API TOC, or nothing. */}
      {hasRail && (
        <Drawer variant="permanent" sx={Styles.desktopDrawer}>
          <Toolbar />
          <Box sx={Styles.drawerBody}>
            {showApiRail ? <ApiToc /> : <ComponentNav />}
          </Box>
        </Drawer>
      )}

      {/* Mobile drawer — destinations on top, component groups below. */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }}
        sx={Styles.mobileDrawer}
      >
        <Toolbar />
        <Box sx={Styles.drawerBody}>
          <DestinationsNav onNavigate={closeMobile} />
          <Divider sx={Styles.mobileDivider} />
          <ComponentNav onNavigate={closeMobile} />
        </Box>
      </Drawer>

      <Box component="main" sx={Styles.main}>
        <Toolbar />
        <Box sx={isLanding ? Styles.contentFull : Styles.content}>
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;

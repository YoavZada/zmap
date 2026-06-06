import { useState, type FC, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Link from "@mui/material/Link";
import Chip from "@mui/material/Chip";
import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import GitHub from "@mui/icons-material/GitHub";
import MenuIcon from "@mui/icons-material/Menu";
import MapIcon from "@mui/icons-material/Map";
import BoltOutlined from "@mui/icons-material/BoltOutlined";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import { navItems } from "../nav";
import { useColorMode } from "../theme";
import { PATHFINDER_URL } from "../env";
import Footer from "./Footer";
import Styles from "./layout.style";

// Library version, injected from packages/zmap/package.json at build time
// (see vite.config.ts). The release workflow keeps the package version and the
// git tag in lockstep, so this reflects the published GitHub release.
const ZMAP_VERSION = import.meta.env.VITE_ZMAP_VERSION ?? "dev";
const RELEASE_URL = `https://github.com/YoavZada/zmap/releases/tag/v${ZMAP_VERSION}`;

type DrawerBodyProps = { onNavigate?: () => void };

const DrawerBody: FC<DrawerBodyProps> = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getStarted = () => {
    onNavigate?.();
    navigate("/");
    // Wait for the intro route to render, then reveal the quick-start block.
    setTimeout(() => {
      document
        .getElementById("quick-start")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <Box sx={Styles.drawerBody}>
      <Box sx={Styles.eyebrow}>
        <Typography variant="overline" color="text.secondary">
          Documentation
        </Typography>
        <Tooltip title="Release notes on GitHub">
          <Link
            href={RELEASE_URL}
            target="_blank"
            rel="noopener"
            underline="hover"
            sx={Styles.version}
          >
            v{ZMAP_VERSION}
          </Link>
        </Tooltip>
      </Box>

      <List sx={Styles.navList}>
        {navItems.map((item) => {
          const selected = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              selected={selected}
              onClick={onNavigate}
              sx={Styles.navItem}
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
      </List>

      <Box sx={Styles.ctaWrap}>
        <Button
          variant="contained"
          startIcon={<BoltOutlined />}
          onClick={getStarted}
          sx={Styles.cta}
        >
          Get Started
        </Button>
      </Box>
    </Box>
  );
};

export type LayoutProps = { children: ReactNode };

const Layout: FC<LayoutProps> = ({ children }) => {
  const { mode, toggle } = useColorMode();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={Styles.root}>
      <AppBar position="fixed" color="default" elevation={0} sx={Styles.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen((o) => !o)}
            sx={Styles.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <MapIcon color="primary" sx={Styles.logo} />
          <Typography variant="h6" fontWeight={800} sx={Styles.title}>
            zmap
          </Typography>
          <Chip
            label="MUI × MapLibre"
            size="small"
            variant="outlined"
            sx={Styles.chip}
          />
          <Box sx={Styles.spacer} />
          <Button
            color="inherit"
            component="a"
            href={PATHFINDER_URL}
            startIcon={<RouteOutlined />}
            sx={Styles.demoLink}
          >
            Pathfinder
          </Button>
          <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
            <IconButton onClick={toggle} color="inherit">
              {mode === "dark" ? <LightMode /> : <DarkMode />}
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
        </Toolbar>
      </AppBar>

      {/* Desktop drawer */}
      <Drawer variant="permanent" sx={Styles.desktopDrawer}>
        <Toolbar />
        <DrawerBody />
      </Drawer>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={Styles.mobileDrawer}
      >
        <Toolbar />
        <DrawerBody onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box component="main" sx={Styles.main}>
        <Toolbar />
        <Box sx={Styles.content}>{children}</Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;

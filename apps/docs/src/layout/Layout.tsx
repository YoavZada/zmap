import { useState, type FC, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import GitHub from "@mui/icons-material/GitHub";
import MenuIcon from "@mui/icons-material/Menu";
import MapIcon from "@mui/icons-material/Map";
import { navItems } from "../nav";
import { useColorMode } from "../theme";
import Footer from "./Footer";
import Styles from "./layout.style";

type NavListProps = { onNavigate?: () => void };

const NavList: FC<NavListProps> = ({ onNavigate }) => {
  const location = useLocation();
  return (
    <List sx={Styles.navList}>
      {navItems.map((item) => {
        const selected = location.pathname === item.path;
        return (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            selected={selected}
            onClick={onNavigate}
            sx={Styles.navItem}
          >
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { fontWeight: selected ? 700 : 500 } }}
            />
          </ListItemButton>
        );
      })}
    </List>
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
        <NavList />
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
        <NavList onNavigate={() => setMobileOpen(false)} />
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

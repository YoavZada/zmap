import type { FC } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import MapIcon from "@mui/icons-material/Map";
import Styles from "./footer.style";

const GITHUB_USER = "https://github.com/YoavZada";
const REPO = "https://github.com/YoavZada/zmap";
const NPM = "https://www.npmjs.com/package/zmap";

type ExtLink = { label: string; href: string };

const product: { label: string; to: string }[] = [
  { label: "Introduction", to: "/" },
  { label: "Providers & Theming", to: "/providers" },
  { label: "Markers", to: "/markers" },
  { label: "Clusters", to: "/clusters" },
];

const community: ExtLink[] = [
  { label: "GitHub", href: REPO },
  { label: "npm package", href: NPM },
];

const resources: ExtLink[] = [
  { label: "MapLibre GL", href: "https://maplibre.org/" },
  { label: "MUI", href: "https://mui.com/" },
  { label: "React", href: "https://react.dev/" },
  { label: "Vite", href: "https://vite.dev/" },
];

const ExternalLink: FC<ExtLink> = ({ label, href }) => (
  <Link href={href} target="_blank" rel="noopener" sx={Styles.link}>
    {label}
  </Link>
);

const Footer: FC = () => {
  return (
    <Box component="footer" sx={Styles.footer}>
      <Box sx={Styles.inner}>
        <Box sx={Styles.top}>
          <Box sx={Styles.brand}>
            <Box sx={Styles.brandRow}>
              <MapIcon color="primary" />
              <Typography variant="h6" fontWeight={800}>
                zmap
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={Styles.tagline}
            >
              MUI-native map components built on MapLibre GL — markers, popups,
              controls, routes, arcs and clustering.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Built by{" "}
              <Link
                href={GITHUB_USER}
                target="_blank"
                rel="noopener"
                sx={Styles.link}
              >
                @YoavZada
              </Link>
            </Typography>
          </Box>

          <Box sx={Styles.columns}>
            <Box sx={Styles.column}>
              <Typography variant="subtitle2" sx={Styles.heading}>
                Product
              </Typography>
              {product.map((p) => (
                <Link
                  key={p.to}
                  component={RouterLink}
                  to={p.to}
                  sx={Styles.link}
                >
                  {p.label}
                </Link>
              ))}
            </Box>

            <Box sx={Styles.column}>
              <Typography variant="subtitle2" sx={Styles.heading}>
                Community
              </Typography>
              {community.map((c) => (
                <ExternalLink key={c.href} {...c} />
              ))}
            </Box>

            <Box sx={Styles.column}>
              <Typography variant="subtitle2" sx={Styles.heading}>
                Resources
              </Typography>
              {resources.map((r) => (
                <ExternalLink key={r.href} {...r} />
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={Styles.bottom}>
          <Typography variant="caption" color="text.secondary">
            © 2026 zmap · MIT License
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Inspired by mapcn · Built with MUI &amp; MapLibre GL
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;

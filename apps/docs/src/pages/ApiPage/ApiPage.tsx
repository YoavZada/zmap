import type { FC, ReactNode } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import propsData from "../../generated/props.json";
import DemoStyles from "../../components/DemoSection/demoSection.style";
import { DEMO_ROUTE } from "../../apiRoutes";
import Styles from "./apiPage.style";

type ApiExport = {
  name: string;
  kind: "value" | "type";
  category: "component" | "hook" | "provider" | "util" | "reexport" | "other";
  description: string;
};

const exports = propsData.exports as ApiExport[];
const components = propsData.components as Record<
  string,
  { description: string }
>;

const firstSentence = (text: string): string => {
  const idx = text.indexOf(". ");
  return idx === -1 ? text : text.slice(0, idx + 1);
};

type SectionProps = {
  title: string;
  anchor: string;
  intro?: ReactNode;
  rows: { name: string; description: string; route?: string }[];
};

const Section: FC<SectionProps> = ({ title, anchor, intro, rows }) => (
  <Box component="section" id={anchor} sx={Styles.section}>
    <Typography variant="h5" fontWeight={700} gutterBottom>
      <Link href={`#${anchor}`} sx={DemoStyles.titleLink}>
        {title}
        <span className="anchor-hash">#</span>
      </Link>
    </Typography>
    {intro && (
      <Typography color="text.secondary" sx={DemoStyles.description}>
        {intro}
      </Typography>
    )}
    <Paper variant="outlined" sx={Styles.paper}>
      <Box sx={Styles.scroller}>
        <Table size="small" sx={Styles.table}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              {rows.some((r) => r.route) && <TableCell>Demo</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell>
                  <Box component="span" sx={Styles.name}>
                    {row.name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box component="span" sx={Styles.description}>
                    {row.description}
                  </Box>
                </TableCell>
                {rows.some((r) => r.route) && (
                  <TableCell>
                    {row.route && (
                      <Link component={RouterLink} to={row.route}>
                        {row.route}
                      </Link>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  </Box>
);

/**
 * Generated index of everything `zmapgl` exports. Data comes from
 * src/generated/props.json (`pnpm gen:props`), so this page can't drift from
 * the library source.
 */
const ApiPage: FC = () => {
  const byCategory = (category: ApiExport["category"]) =>
    exports.filter((e) => e.category === category && e.kind === "value");

  const componentRows = Object.keys(components)
    .sort()
    .map((name) => ({
      name,
      description: firstSentence(components[name].description),
      route: DEMO_ROUTE[name],
    }));

  const hookRows = byCategory("hook").map((e) => ({
    name: e.name,
    description: e.description,
  }));
  const providerRows = byCategory("provider").map((e) => ({
    name: e.name,
    description: e.description,
  }));
  const utilRows = byCategory("util").map((e) => ({
    name: e.name,
    description: e.description,
  }));
  const typeRows = exports.filter((e) => e.kind === "type");

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        API Reference
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        Every export shipped by <code>zmapgl</code>, generated from the library
        source and its JSDoc — components, hooks, providers, and utilities.
        Per-component prop tables live on each component's page. Power users can
        also import <code>maplibregl</code>, the full MapLibre GL namespace, for
        anything below the React layer.
      </Typography>

      <Section
        title="Components"
        anchor="components"
        intro="Each links to the page where it's demoed live."
        rows={componentRows}
      />
      <Section
        title="Hooks"
        anchor="hooks"
        intro={
          <>
            Everything a custom component needs to talk to the map. Gate work
            behind <code>loaded</code> from <code>useMapContext()</code>, and
            build GL-layer components on <code>useMapLayer</code> so they
            survive theme-driven style swaps.
          </>
        }
        rows={hookRows}
      />
      <Section
        title="Providers"
        anchor="providers"
        intro={
          <>
            Basemap sources for the <code>provider</code> prop. All are keyless
            except <code>maptiler</code>, a factory:{" "}
            <code>maptiler(apiKey, style?)</code>.
          </>
        }
        rows={providerRows}
      />
      <Section
        title="Utilities"
        anchor="utilities"
        intro="Pure helpers — geometry, GeoJSON builders, measuring, binning, and MUI palette color resolution."
        rows={utilRows}
      />

      <Box component="section" id="types" sx={Styles.section}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          <Link href="#types" sx={DemoStyles.titleLink}>
            Types
            <span className="anchor-hash">#</span>
          </Link>
        </Typography>
        <Typography color="text.secondary" sx={DemoStyles.description}>
          Exported TypeScript types — props types are named{" "}
          <code>&lt;Component&gt;Props</code>.
        </Typography>
        <Paper variant="outlined" sx={Styles.paper}>
          <Box sx={Styles.typeChips}>
            {typeRows.map((t) => (
              <Chip
                key={t.name}
                label={t.name}
                size="small"
                variant="outlined"
                title={t.description}
              />
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ApiPage;

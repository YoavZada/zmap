import type { FC, ReactNode } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import propsData from "../../generated/props.json";
import DemoStyles from "../DemoSection/demoSection.style";
import Styles from "./propsTable.style";

export type PropsTableProps = {
  /** A component name from the generated props.json (e.g. "Cluster"). */
  component: string;
  /** Extra prose under the heading (e.g. "also accepts all MUI Box props"). */
  note?: ReactNode;
};

type PropRow = {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
};

/**
 * API reference table for one component, generated from the library's actual
 * prop types and JSDoc (`pnpm gen:props` → src/generated/props.json).
 */
const PropsTable: FC<PropsTableProps> = ({ component, note }) => {
  const entry = (
    propsData.components as Record<
      string,
      { description: string; props: PropRow[] }
    >
  )[component];
  if (!entry) return null;

  const anchor = `${component.toLowerCase()}-props`;

  return (
    <Box component="section" id={anchor} sx={Styles.section}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        <Link href={`#${anchor}`} sx={DemoStyles.titleLink}>
          <code>{component}</code> props
          <span className="anchor-hash">#</span>
        </Link>
      </Typography>
      {note && (
        <Typography color="text.secondary" sx={DemoStyles.description}>
          {note}
        </Typography>
      )}
      <Paper variant="outlined" sx={Styles.paper}>
        <Box sx={Styles.scroller}>
          <Table size="small" sx={Styles.table}>
            <TableHead>
              <TableRow>
                <TableCell>Prop</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Default</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entry.props.map((prop) => (
                <TableRow key={prop.name}>
                  <TableCell>
                    <Box component="span" sx={Styles.propName}>
                      {prop.name}
                    </Box>
                    {prop.required && (
                      <Box component="span" sx={Styles.required}>
                        *
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box component="span" sx={Styles.propType}>
                      {prop.type}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box component="span" sx={Styles.defaultValue}>
                      {prop.defaultValue ?? "—"}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box component="span" sx={Styles.description}>
                      {prop.description}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
};

export default PropsTable;

import { useState, type FC, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CodeBlock from "./CodeBlock";
import Styles from "./demoSection.style";

export type DemoSectionProps = {
  title: string;
  description?: ReactNode;
  demo: ReactNode;
  code: string;
  children?: ReactNode;
};

const DemoSection: FC<DemoSectionProps> = ({
  title,
  description,
  demo,
  code,
  children,
}) => {
  const [tab, setTab] = useState(0);

  return (
    <Box component="section" sx={Styles.section}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography color="text.secondary" sx={Styles.description}>
          {description}
        </Typography>
      )}
      {children}
      <Paper variant="outlined" sx={Styles.panel}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={Styles.tabs}>
          <Tab label="Preview" sx={Styles.tab} />
          <Tab label="Code" sx={Styles.tab} />
        </Tabs>
        {tab === 0 ? (
          <Box sx={Styles.preview}>{demo}</Box>
        ) : (
          <Box sx={Styles.codeArea}>
            <CodeBlock code={code} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DemoSection;

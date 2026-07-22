import { useState, type FC, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Skeleton from "@mui/material/Skeleton";
import Link from "@mui/material/Link";
import CodeBlock from "../CodeBlock";
import { stripDemoSource } from "../../utils/stripDemoSource";
import { useRevealOnScroll } from "../../utils/useRevealOnScroll";
import Styles from "./demoSection.style";

export type DemoSectionProps = {
  title: string;
  description?: ReactNode;
  demo: ReactNode;
  code: string;
  children?: ReactNode;
  /**
   * Height reserved for the preview before its map mounts, keeping the page
   * from shifting on reveal. Set to a demo's map height when it differs much
   * from the default.
   */
  previewMinHeight?: number;
};

const DemoSection: FC<DemoSectionProps> = ({
  title,
  description,
  demo,
  code,
  children,
  previewMinHeight = 440,
}) => {
  const [tab, setTab] = useState(0);
  // Bound live WebGL contexts no matter how many demos a page stacks up.
  const { ref: previewRef, revealed } = useRevealOnScroll();

  const anchor = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <Box
      component="section"
      id={anchor}
      data-testid="demo-section"
      sx={Styles.section}
    >
      <Typography variant="h5" fontWeight={700} gutterBottom>
        <Link href={`#${anchor}`} sx={Styles.titleLink}>
          {title}
          <span className="anchor-hash">#</span>
        </Link>
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
          <Box ref={previewRef} sx={Styles.preview}>
            {revealed ? (
              demo
            ) : (
              <Skeleton
                variant="rounded"
                animation="wave"
                sx={Styles.placeholder(previewMinHeight)}
              />
            )}
          </Box>
        ) : (
          <Box sx={Styles.codeArea}>
            <CodeBlock code={stripDemoSource(code)} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DemoSection;

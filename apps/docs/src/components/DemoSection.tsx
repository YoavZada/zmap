import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Skeleton from "@mui/material/Skeleton";
import Link from "@mui/material/Link";
import CodeBlock from "./CodeBlock";
import { stripDemoSource } from "../utils/stripDemoSource";
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
  // Each demo is a full MapLibre WebGL context, so we only mount it once its
  // section scrolls near the viewport — keeping live contexts (and tile fetches)
  // bounded no matter how many demos a page stacks up. Once revealed it stays
  // mounted, to avoid re-initialising the map (and re-fetching tiles) on scroll.
  const [revealed, setRevealed] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (revealed) return;
    const el = previewRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      // Mount a little before it enters view so the map is ready on arrival.
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed, tab]);

  const anchor = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <Box component="section" id={anchor} sx={Styles.section}>
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

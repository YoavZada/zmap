import { useState, type FC } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Check from "@mui/icons-material/Check";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Bolt from "@mui/icons-material/Bolt";
import CodeBlock from "../CodeBlock";
import { useRevealOnScroll } from "../../utils/useRevealOnScroll";
import { openBlockInStackBlitz } from "../../utils/stackblitz";
import type { BlockDef } from "../../blocks";
import Styles from "./blockSection.style";

export type BlockSectionProps = {
  block: BlockDef;
};

/**
 * One entry in the Blocks gallery: a complete, copy-paste scenario with a
 * live preview, its full source, and a one-click copy of the whole file.
 */
const BlockSection: FC<BlockSectionProps> = ({ block }) => {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const { ref: previewRef, revealed } = useRevealOnScroll();
  const { Component } = block;
  const previewMinHeight = block.previewMinHeight ?? 560;

  const copy = async () => {
    await navigator.clipboard.writeText(block.source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Box component="section" id={block.id} sx={Styles.section}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        <Link href={`#${block.id}`} sx={Styles.titleLink}>
          {block.title}
          <span className="anchor-hash">#</span>
        </Link>
      </Typography>
      <Typography color="text.secondary" sx={Styles.description}>
        {block.description}
      </Typography>
      <Typography component="div" sx={Styles.componentList}>
        {block.components.join(" · ")}
      </Typography>

      <Paper variant="outlined" sx={Styles.panel}>
        <Box sx={Styles.tabBar}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={Styles.tabs}>
            <Tab label="Preview" sx={Styles.tab} />
            <Tab label="Code" sx={Styles.tab} />
          </Tabs>
          <Tooltip title="Open in StackBlitz">
            <IconButton
              size="small"
              onClick={() => openBlockInStackBlitz(block)}
              sx={Styles.copyButton}
            >
              <Bolt fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={copied ? "Copied" : "Copy full source"}>
            <IconButton size="small" onClick={copy} sx={Styles.copyButton}>
              {copied ? (
                <Check fontSize="small" />
              ) : (
                <ContentCopy fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
        {tab === 0 ? (
          <Box ref={previewRef} sx={Styles.preview}>
            {revealed ? (
              <Component />
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
            <CodeBlock code={block.source} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default BlockSection;

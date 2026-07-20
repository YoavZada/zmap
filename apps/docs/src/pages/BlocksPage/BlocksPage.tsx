import type { FC } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import PageHeader from "../../components/PageHeader";
import BlockSection from "../../components/BlockSection";
import { blocks } from "../../blocks";
import Styles from "./blocksPage.style";

const BlocksPage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Blocks"
        lead="Complete scenarios composed from zmapgl primitives. Every block is one self-contained file — copy it straight into your app and it runs."
      />

      <Box sx={Styles.jumpRow}>
        {blocks.map((block) => (
          <Link
            key={block.id}
            href={`#${block.id}`}
            underline="hover"
            sx={Styles.jumpLink}
          >
            {block.title}
          </Link>
        ))}
      </Box>

      {blocks.map((block) => (
        <BlockSection key={block.id} block={block} />
      ))}
    </Box>
  );
};

export default BlocksPage;

import type { FC } from "react";
import Box from "@mui/material/Box";
import ReactMarkdown from "react-markdown";
import changelogSource from "../../../../../packages/zmap/CHANGELOG.md?raw";
import PageHeader from "../../components/PageHeader";
import Styles from "./changelogPage.style";

// react-markdown renders raw HTML nodes as escaped, visible text rather than
// dropping them — so the maintainer-facing HTML comment at the top of the
// file (format/versioning notes) would otherwise leak onto the page. Strip
// HTML comments before handing the source to react-markdown.
const changelog = changelogSource.replace(/<!--[\s\S]*?-->/g, "");

const ChangelogPage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Changelog"
        lead="Release history for zmapgl — every version and its changes, newest first."
      />
      <Box sx={Styles.content}>
        {/* The file's own H1 duplicates the PageHeader title — drop it. */}
        <ReactMarkdown components={{ h1: () => null }}>
          {changelog}
        </ReactMarkdown>
      </Box>
    </Box>
  );
};

export default ChangelogPage;

import type { FC, ReactNode } from "react";
import Typography from "@mui/material/Typography";
import Styles from "./pageHeader.style";

export type PageHeaderProps = {
  /** The page's h4 title. */
  title: string;
  /** Intro paragraph under the title; inline `<code>` welcome. */
  lead?: ReactNode;
};

/** The standard page opening: h4 title + secondary-text lead paragraph. */
const PageHeader: FC<PageHeaderProps> = ({ title, lead }) => {
  return (
    <>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        {title}
      </Typography>
      {lead && (
        <Typography color="text.secondary" sx={Styles.lead}>
          {lead}
        </Typography>
      )}
    </>
  );
};

export default PageHeader;

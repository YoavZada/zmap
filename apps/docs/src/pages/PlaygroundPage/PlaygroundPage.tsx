import { Suspense, lazy, type FC } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import PageHeader from "../../components/PageHeader";
import Styles from "./playgroundPage.style";

const PlaygroundEditor = lazy(() => import("./PlaygroundEditor"));

const PlaygroundPage: FC = () => (
  <Box>
    <PageHeader
      title="Playground"
      lead={
        <>
          Edit a live zmapgl app and see the map update. Runs against the
          published <code>zmapgl</code> package via CodeSandbox's bundler (needs
          network); if it's unavailable you still get the editor.
        </>
      }
    />
    <Suspense
      fallback={
        <Box sx={Styles.loading}>
          <CircularProgress />
        </Box>
      }
    >
      <PlaygroundEditor />
    </Suspense>
  </Box>
);

export default PlaygroundPage;

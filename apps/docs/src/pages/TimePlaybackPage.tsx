import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DemoSection from "../components/DemoSection";
import PropsTable from "../components/PropsTable";
import TimePlaybackDemo from "../demos/time/TimePlaybackDemo";
import timePlaybackDemoSource from "../demos/time/TimePlaybackDemo.tsx?raw";
import Styles from "./timePlaybackPage.style";

export const TimePlaybackPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Time playback
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        <code>&lt;TimePlayback&gt;</code> animates time-stamped GeoJSON points
        along a playhead — ideal for trips and trajectories. It paints a faint
        trail plus a bright "head" of the most-recent positions, and ships a
        themed MUI transport bar (play/pause, scrubber, speed). The filtering
        runs on the GPU, so it stays smooth with thousands of points. Press play
        and scrub the timeline below.
      </Typography>

      <DemoSection
        title="Animated trips"
        description="Three London trips replay together. trail keeps a trailing window; drop it for a cumulative path that draws itself."
        code={timePlaybackDemoSource}
        demo={<TimePlaybackDemo />}
      />
      <PropsTable component="TimePlayback" />
    </Box>
  );
};

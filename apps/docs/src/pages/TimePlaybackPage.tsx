import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Map, TimePlayback } from "zmapgl";
import DemoSection from "../components/DemoSection";
import Styles from "./timePlaybackPage.style";
import { trips } from "../data";

const mmss = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const code = `import type { FC } from "react";
import { Map, TimePlayback } from "zmapgl";

// trips: a GeoJSON FeatureCollection of points, each with a numeric "time".
const MyMap: FC = () => {
  return (
    <Map center={[-0.11, 51.508]} zoom={12.2}>
      <TimePlayback
        data={trips}
        timeProperty="time"
        trail={120}              // keep ~120s of trail; omit for a cumulative path
        color="secondary.main"
        duration={14}            // seconds for one full playthrough at 1×
        autoplay
        formatTime={(s) => \`\${Math.floor(s / 60)}:\${String(Math.floor(s % 60)).padStart(2, "0")}\`}
      />
    </Map>
  );
};

export default MyMap;`;

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
        code={code}
        demo={
          <Map center={[-0.11, 51.508]} zoom={12.2} sx={Styles.map}>
            <TimePlayback
              data={trips}
              timeProperty="time"
              trail={120}
              color="secondary.main"
              duration={14}
              autoplay
              formatTime={mmss}
            />
          </Map>
        }
      />
    </Box>
  );
};

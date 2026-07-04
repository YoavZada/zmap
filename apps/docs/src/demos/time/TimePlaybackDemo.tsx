import type { FC } from "react";
import { Map, TimePlayback } from "zmapgl";
import { trips } from "../../data";

const mmss = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

// trips: a GeoJSON FeatureCollection of points, each with a numeric "time".
const TimePlaybackDemo: FC = () => {
  return (
    <Map
      center={[-0.11, 51.508]}
      zoom={12.2}
      sx={{ height: 480, borderRadius: 2 }}
    >
      <TimePlayback
        data={trips}
        timeProperty="time"
        trail={120} // keep ~120s of trail; omit for a cumulative path
        color="secondary.main"
        duration={14} // seconds for one full playthrough at 1×
        autoplay
        formatTime={mmss}
      />
    </Map>
  );
};

export default TimePlaybackDemo;

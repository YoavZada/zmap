import type { FC } from "react";
import Box from "@mui/material/Box";
import { Marker } from "zmap";
import type { LngLatTuple } from "zmap";
import type { RoadNetwork } from "../lib/types";
import Styles from "./endpoints.style";

export type EndpointsProps = {
  network: RoadNetwork;
  start: number | null;
  end: number | null;
  onDrag: (which: "start" | "end", lngLat: LngLatTuple) => void;
};

/** Draggable A (start) and B (end) markers, snapped to graph nodes. */
const Endpoints: FC<EndpointsProps> = ({ network, start, end, onDrag }) => {
  return (
    <>
      {start !== null && (
        <Marker
          longitude={network.nodes[start].lng}
          latitude={network.nodes[start].lat}
          anchor="center"
          draggable
          onDragEnd={(lngLat) => onDrag("start", lngLat)}
        >
          <Box sx={Styles.pin("success")}>A</Box>
        </Marker>
      )}
      {end !== null && (
        <Marker
          longitude={network.nodes[end].lng}
          latitude={network.nodes[end].lat}
          anchor="center"
          draggable
          onDragEnd={(lngLat) => onDrag("end", lngLat)}
        >
          <Box sx={Styles.pin("error")}>B</Box>
        </Marker>
      )}
    </>
  );
};

export default Endpoints;

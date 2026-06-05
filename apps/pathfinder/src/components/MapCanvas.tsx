import type { FC } from "react";
import { Map, MapControls } from "zmap";
import type { RoadNetwork } from "../lib/types";
import type { Pathfinder } from "../hooks/usePathfinder";
import MapInteraction from "./MapInteraction";
import NetworkLayer from "./NetworkLayer";
import SearchTreeLayer from "./SearchTreeLayer";
import PathLayer from "./PathLayer";
import Endpoints from "./Endpoints";
import Styles from "./mapCanvas.style";

export type MapCanvasProps = {
  network: RoadNetwork;
  pathfinder: Pathfinder;
};

const CENTER: [number, number] = [-73.9857, 40.7484];

/** The interactive map: basemap + the routable network, search tree, and path. */
const MapCanvas: FC<MapCanvasProps> = ({ network, pathfinder }) => {
  const { phase, result, exploredVisible, pathVisible, pickPoint, dragEndpoint } =
    pathfinder;

  return (
    <Map center={CENTER} zoom={13.2} colorScheme="auto" sx={Styles.map}>
      <MapControls position="top-right" showGeolocate={false} />
      <MapInteraction onPick={pickPoint} active={phase !== "animating"} />

      <NetworkLayer network={network} />

      {result && (
        <SearchTreeLayer
          network={network}
          settled={result.settled}
          visible={exploredVisible}
        />
      )}

      {result?.found && (
        <PathLayer coordinates={result.coordinates} visible={pathVisible} />
      )}

      <Endpoints
        network={network}
        start={pathfinder.start}
        end={pathfinder.end}
        onDrag={dragEndpoint}
      />
    </Map>
  );
};

export default MapCanvas;

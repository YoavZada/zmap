import type { FC } from "react";
import { Map, MapControls } from "zmapgl";
import type { City } from "../lib/cities";
import type { Pathfinder } from "../hooks/usePathfinder";
import MapInteraction from "./MapInteraction";
import CityFocus from "./CityFocus";
import ConnectorLayer from "./ConnectorLayer";
import PathLayer from "./PathLayer";
import Waypoints from "./Waypoints";
import Styles from "./mapCanvas.style";

export type MapCanvasProps = {
  pathfinder: Pathfinder;
  city: City;
};

/** The interactive map: basemap + the route, off-street connectors, and points. */
const MapCanvas: FC<MapCanvasProps> = ({ pathfinder, city }) => {
  const {
    points,
    result,
    phase,
    pathVisible,
    addPoint,
    movePoint,
    removePoint,
  } = pathfinder;

  // The result can briefly lag the points (during a refetch); only draw the
  // snapped connectors / order numbers while it still lines up with the points.
  const inSync = result?.snapped.length === points.length;

  return (
    <Map
      center={city.center}
      zoom={city.zoom}
      colorScheme="auto"
      sx={Styles.map}
    >
      <MapControls position="top-right" showGeolocate={false} />
      <MapInteraction onPick={addPoint} active={phase !== "routing"} />
      <CityFocus center={city.center} zoom={city.zoom} />

      {result && inSync && (
        <ConnectorLayer points={points} snapped={result.snapped} />
      )}

      {result && (
        <PathLayer coordinates={result.coordinates} visible={pathVisible} />
      )}

      <Waypoints
        points={points}
        visitOrder={result && inSync ? result.visitOrder : null}
        onMove={movePoint}
        onRemove={removePoint}
      />
    </Map>
  );
};

export default MapCanvas;

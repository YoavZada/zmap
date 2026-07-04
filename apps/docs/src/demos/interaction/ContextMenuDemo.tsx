import type { FC } from "react";
import { Map, ContextMenu } from "zmapgl";

const ContextMenuDemo: FC = () => {
  return (
    <Map
      center={[2.3522, 48.8566]}
      zoom={4}
      sx={{ height: 440, borderRadius: 2 }}
    >
      {/* right-click the map → "Center here" / "Copy coords" / "Drop marker".
          Dropped markers are draggable; click one to remove it. */}
      <ContextMenu />

      {/* or supply your own items:
          <ContextMenu items={(lngLat) => [
            { label: "Log here", icon: <Place />, onClick: () => console.log(lngLat) },
          ]} /> */}
    </Map>
  );
};

export default ContextMenuDemo;

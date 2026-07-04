import type { FC } from "react";
import { Map, HexbinLayer } from "zmapgl";
import { scatterPoints } from "../../data";

const SquareGridDemo: FC = () => {
  return (
    <Map center={[-96, 38]} zoom={3.4} sx={{ height: 480, borderRadius: 2 }}>
      {/* cell="square" for a rectangular grid instead of hexagons */}
      <HexbinLayer points={scatterPoints} cell="square" radius={70} />
    </Map>
  );
};

export default SquareGridDemo;

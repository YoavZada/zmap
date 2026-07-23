import { Map, MapControls, Marker } from "zmapgl";

// Server component. zmapgl's "use client" banner makes these client
// references — if the banner regresses, `next build` fails right here.
export default function Home() {
  return (
    <main>
      <h1>zmapgl Next.js smoke</h1>
      <Map center={[-0.1276, 51.5072]} zoom={11} sx={{ height: 400 }}>
        <MapControls position="top-right" />
        <Marker longitude={-0.1276} latitude={51.5072} />
      </Map>
    </main>
  );
}

import type { FC } from "react";
import { GeocoderControl, Map } from "zmapgl";
import type { GeocodeResult, GeocodingProvider } from "zmapgl";

const CITIES: GeocodeResult[] = [
  { id: "tokyo", name: "Tokyo", address: "Japan", center: [139.6917, 35.6895] },
  { id: "delhi", name: "Delhi", address: "India", center: [77.209, 28.6139] },
  {
    id: "shanghai",
    name: "Shanghai",
    address: "China",
    center: [121.4737, 31.2304],
  },
  {
    id: "sao-paulo",
    name: "São Paulo",
    address: "Brazil",
    center: [-46.6333, -23.5505],
  },
  {
    id: "mexico-city",
    name: "Mexico City",
    address: "Mexico",
    center: [-99.1332, 19.4326],
  },
  { id: "cairo", name: "Cairo", address: "Egypt", center: [31.2357, 30.0444] },
  {
    id: "new-york",
    name: "New York",
    address: "United States",
    center: [-74.006, 40.7128],
  },
  { id: "paris", name: "Paris", address: "France", center: [2.3522, 48.8566] },
];

// Any backend works: implement GeocodingProvider and hand it to the control.
// This one is a static list — instant, offline, deterministic.
const offlineCities: GeocodingProvider = {
  id: "offline-cities",
  minQueryLength: 1,
  debounceMs: 0,
  search: async (query) => {
    const q = query.toLowerCase();
    return CITIES.filter((city) => city.name.toLowerCase().includes(q));
  },
};

const OfflineProviderGeocoder: FC = () => (
  <Map center={[10, 20]} zoom={1.2} sx={{ height: 440, borderRadius: 2 }}>
    <GeocoderControl provider={offlineCities} zoom={10} />
  </Map>
);

export default OfflineProviderGeocoder;

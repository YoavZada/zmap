/** A starting location for the map — a city center and a city-level zoom. */
export type City = {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
};

/** Cities offered in the "Start location" picker. The first is the default. */
export const CITIES: City[] = [
  { id: "nyc", name: "New York", center: [-73.9857, 40.7484], zoom: 13.2 },
  { id: "telaviv", name: "Tel Aviv", center: [34.7806, 32.0809], zoom: 13 },
  { id: "london", name: "London", center: [-0.1276, 51.5072], zoom: 12.8 },
  { id: "berlin", name: "Berlin", center: [13.405, 52.52], zoom: 12.8 },
  { id: "paris", name: "Paris", center: [2.3522, 48.8566], zoom: 13 },
  { id: "amsterdam", name: "Amsterdam", center: [4.9041, 52.3676], zoom: 13 },
  { id: "barcelona", name: "Barcelona", center: [2.1734, 41.3851], zoom: 13 },
  {
    id: "sanfrancisco",
    name: "San Francisco",
    center: [-122.4194, 37.7749],
    zoom: 12.8,
  },
  { id: "tokyo", name: "Tokyo", center: [139.7671, 35.6812], zoom: 12.8 },
];

/** The city the map opens on. */
export const DEFAULT_CITY: City = CITIES[0];

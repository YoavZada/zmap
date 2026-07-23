// The Blocks gallery registry. Self-contained means a block imports only
// react/@mui/zmapgl (plus type-only `geojson`), so its source runs verbatim
// as a standalone app — regional-analytics is the documented exception (see
// stackblitzPortable below). Sources are shown (and copied) whole: no
// ---cut--- markers.
import type { FC } from "react";
import StoreLocatorBlock from "./store-locator/StoreLocatorBlock";
import storeLocatorSource from "./store-locator/StoreLocatorBlock.tsx?raw";
import RegionalAnalyticsBlock from "./regional-analytics/RegionalAnalyticsBlock";
import regionalAnalyticsSource from "./regional-analytics/RegionalAnalyticsBlock.tsx?raw";
import FlightNetworkBlock from "./flight-network/FlightNetworkBlock";
import flightNetworkSource from "./flight-network/FlightNetworkBlock.tsx?raw";
import DeliveryTrackerBlock from "./delivery-tracker/DeliveryTrackerBlock";
import deliveryTrackerSource from "./delivery-tracker/DeliveryTrackerBlock.tsx?raw";
import CityExplorer3DBlock from "./city-explorer/CityExplorer3DBlock";
import cityExplorer3DSource from "./city-explorer/CityExplorer3DBlock.tsx?raw";

export interface BlockDef {
  /** Anchor id, e.g. "store-locator". */
  id: string;
  title: string;
  description: string;
  /** The zmapgl components the block composes, for the header line. */
  components: string[];
  /** Height reserved before the map lazily mounts. Default 560. */
  previewMinHeight?: number;
  Component: FC;
  /** The block's full source (?raw import) — shown and copied verbatim. */
  source: string;
  /**
   * False when the source imports app-local modules and can't run
   * standalone (hides the StackBlitz button). Default true.
   */
  stackblitzPortable?: boolean;
}

export const blocks: BlockDef[] = [
  {
    id: "store-locator",
    title: "Store locator",
    description:
      "Clustered locations with a synced list panel — selecting a row eases the camera over and opens a details popup.",
    components: ["Map", "Cluster", "Popup", "MapControls"],
    Component: StoreLocatorBlock,
    source: storeLocatorSource,
  },
  {
    id: "regional-analytics",
    title: "Regional analytics",
    description:
      "A world choropleth of visitors by country with a shared-spec legend, a toggleable top-markets overlay, and a KPI strip fed by map clicks.",
    components: [
      "Map",
      "ChoroplethLayer",
      "Legend",
      "Layer",
      "LayerControl",
      "PointLayer",
    ],
    Component: RegionalAnalyticsBlock,
    source: regionalAnalyticsSource,
    // Imports `../../data` (worldCountries) — can't run standalone.
    stackblitzPortable: false,
  },
  {
    id: "flight-network",
    title: "Flight network",
    description:
      "Geodesic arcs out of a switchable hub airport, with decluttered GPU labels for every destination.",
    components: ["Map", "Arc", "SymbolLayer", "Marker"],
    Component: FlightNetworkBlock,
    source: flightNetworkSource,
  },
  {
    id: "delivery-tracker",
    title: "Delivery tracker",
    description:
      "A courier animating along the planned route — the transport bar drives the trail while the status card tracks progress.",
    components: ["Map", "Route", "TimePlayback", "Marker"],
    Component: DeliveryTrackerBlock,
    source: deliveryTrackerSource,
  },
  {
    id: "city-explorer-3d",
    title: "City explorer 3D",
    description:
      "Downtown blocks extruded and tinted by height — tilt into 3D and click a tower to inspect it.",
    components: ["Map", "ExtrusionLayer", "Legend", "MapControls"],
    Component: CityExplorer3DBlock,
    source: cityExplorer3DSource,
  },
];

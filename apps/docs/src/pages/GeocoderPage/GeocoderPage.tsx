import type { FC } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import DemoSection from "../../components/DemoSection";
import PageHeader from "../../components/PageHeader";
import PropsTable from "../../components/PropsTable";
import BasicGeocoder from "../../demos/geocoder/BasicGeocoder";
import basicGeocoderSource from "../../demos/geocoder/BasicGeocoder.tsx?raw";
import OfflineProviderGeocoder from "../../demos/geocoder/OfflineProviderGeocoder";
import offlineProviderGeocoderSource from "../../demos/geocoder/OfflineProviderGeocoder.tsx?raw";

const GeocoderPage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Geocoder"
        lead={
          <>
            <code>GeocoderControl</code> puts an MUI Autocomplete place search
            on the map: type, pick a result, and the camera flies there with a
            marker. Search is powered by pluggable providers — the default is{" "}
            <Link
              href="https://photon.komoot.io"
              target="_blank"
              rel="noopener"
            >
              Photon
            </Link>
            , komoot's free OSM geocoder (fair use; self-host it for production
            traffic). A <code>nominatim</code> provider ships too, tuned to the
            public instance's policy (long debounce; self-host for heavy use).
            Results are © OpenStreetMap contributors.
          </>
        }
      />

      <DemoSection
        title="Place search"
        description="Zero config: the default Photon provider searches as you type (requests only fire on input). Picking a result flies the camera and drops a marker."
        code={basicGeocoderSource}
        demo={<BasicGeocoder />}
      />
      <DemoSection
        title="Custom provider"
        description="Implement the GeocodingProvider interface to search anything — your own API, MapTiler, or, as here, a static offline list."
        code={offlineProviderGeocoderSource}
        demo={<OfflineProviderGeocoder />}
      />
      <PropsTable component="GeocoderControl" />
    </Box>
  );
};

export default GeocoderPage;

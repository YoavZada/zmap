import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DemoSection from "../components/DemoSection";
import PropsTable from "../components/PropsTable";
import MarkerPlayground from "../demos/markers/MarkerPlayground";
import markerPlaygroundSource from "../demos/markers/MarkerPlayground.tsx?raw";
import DefaultPins from "../demos/markers/DefaultPins";
import defaultPinsSource from "../demos/markers/DefaultPins.tsx?raw";
import CustomMarkerContent from "../demos/markers/CustomMarkerContent";
import customMarkerContentSource from "../demos/markers/CustomMarkerContent.tsx?raw";
import DraggableMarker from "../demos/markers/DraggableMarker";
import draggableMarkerSource from "../demos/markers/DraggableMarker.tsx?raw";
import Styles from "./markersPage.style";

export const MarkersPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Markers
      </Typography>
      <Typography color="text.secondary" sx={Styles.intro}>
        A <code>Marker</code> places content at a coordinate via a React portal,
        so you can render any MUI element — icons, chips, avatars, cards. With
        no children it falls back to a themed pin.
      </Typography>

      <DemoSection
        title="Interactive playground"
        description="Click the map to drop a marker, click a marker to remove it, or edit a marker's coordinates below."
        code={markerPlaygroundSource}
        demo={<MarkerPlayground />}
      />

      <DemoSection
        title="Default pins"
        description="Render a Marker with no children to get a theme-colored pin."
        code={defaultPinsSource}
        demo={<DefaultPins />}
      />

      <DemoSection
        title="Custom MUI markers"
        description="Pass any MUI component as children. Use anchor='center' for badges and chips."
        code={customMarkerContentSource}
        demo={<CustomMarkerContent />}
      />

      <DemoSection
        title="Draggable markers"
        description="Set draggable and read the new position from onDragEnd."
        code={draggableMarkerSource}
        demo={<DraggableMarker />}
      />
      <PropsTable component="Marker" />
    </Box>
  );
};

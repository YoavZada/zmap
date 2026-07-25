import type { FC } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { useColorMode } from "../../theme";

const APP_TSX = `import { Map, MapControls, Marker } from "zmapgl";
import "zmapgl/styles.css";

export default function App() {
  return (
    <Map center={[-0.1276, 51.5072]} zoom={11} style={{ height: "100vh" }}>
      <MapControls />
      <Marker longitude={-0.1276} latitude={51.5072} />
    </Map>
  );
}
`;

const MAIN_TSX = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
`;

/** Heavy Sandpack editor, loaded lazily so it never weighs on other routes. */
const PlaygroundEditor: FC = () => {
  const { mode } = useColorMode();
  return (
    <Sandpack
      template="vite-react-ts"
      theme={mode === "dark" ? "dark" : "light"}
      files={{ "/src/App.tsx": APP_TSX, "/src/main.tsx": MAIN_TSX }}
      customSetup={{
        dependencies: {
          zmapgl: "^0.8.0",
          "maplibre-gl": "^5.15.0",
          "@mui/material": "^7",
          "@mui/icons-material": "^7",
          "@emotion/react": "^11",
          "@emotion/styled": "^11",
        },
      }}
      options={{ editorHeight: 560, showTabs: true }}
    />
  );
};

export default PlaygroundEditor;

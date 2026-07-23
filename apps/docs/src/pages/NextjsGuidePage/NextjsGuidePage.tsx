import type { FC } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CodeBlock from "../../components/CodeBlock";
import PageHeader from "../../components/PageHeader";
import Styles from "./nextjsGuidePage.style";

const installCode = `npm install zmapgl @mui/material @mui/icons-material \\
  @emotion/react @emotion/styled maplibre-gl`;

const layoutCode = `import type { ReactNode } from "react";
import "zmapgl/styles.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;

const serverPageCode = `import { Map, MapControls, Marker } from "zmapgl";

// A server component — no "use client" needed here. zmapgl ships a
// "use client" banner, so its components are client references already.
export default function Home() {
  return (
    <Map center={[-0.1276, 51.5072]} zoom={11} sx={{ height: 400 }}>
      <MapControls position="top-right" />
      <Marker longitude={-0.1276} latitude={51.5072} />
    </Map>
  );
}`;

const clientWrapperCode = `"use client";

import { Map, Marker } from "zmapgl";

// Reach for a client component when you need interactivity: callbacks,
// state, or the raw MapLibre instance via useMap().
export default function InteractiveMap() {
  return (
    <Map
      center={[-0.1276, 51.5072]}
      zoom={11}
      sx={{ height: 400 }}
      onClick={(e) => console.log(e.lngLat)}
    >
      <Marker longitude={-0.1276} latitude={51.5072} draggable />
    </Map>
  );
}`;

const pagesRouterCode = `// pages/_app.tsx
import type { AppProps } from "next/app";
import "zmapgl/styles.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}`;

const viteSsrNote = `// Nothing to configure. Since 0.6.0, importing "zmapgl" is safe in
// plain Node — no ssr.noExternal entry, no dynamic-import dance.
import { Map } from "zmapgl";`;

const NextjsGuidePage: FC = () => {
  return (
    <Box>
      <PageHeader
        title="Next.js & SSR"
        lead="zmapgl works in Next.js and every SSR framework: import the stylesheet once, render components anywhere — the map mounts client-side."
      />

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Install
        </Typography>
        <CodeBlock code={installCode} language="bash" filename="Terminal" />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Add the stylesheet once
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          The map controls and popups need MapLibre&apos;s CSS. Import it in
          your root layout (app router) — it ships with zmapgl.
        </Typography>
        <CodeBlock code={layoutCode} filename="app/layout.tsx" />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Use it from server components
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          zmapgl is published with a <code>&quot;use client&quot;</code> banner,
          so server components can import and render it directly — Next.js draws
          the boundary for you. The map container server-renders; the WebGL
          canvas attaches on the client.
        </Typography>
        <CodeBlock code={serverPageCode} filename="app/page.tsx" />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Interactivity lives in client components
        </Typography>
        <Typography color="text.secondary" sx={Styles.sectionLead}>
          Event callbacks and hooks (like <code>useMap</code>) are client-side —
          put them in a <code>&quot;use client&quot;</code> component, as with
          any React library.
        </Typography>
        <CodeBlock code={clientWrapperCode} filename="app/InteractiveMap.tsx" />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Pages router
        </Typography>
        <CodeBlock code={pagesRouterCode} filename="pages/_app.tsx" />
      </Box>

      <Box sx={Styles.section}>
        <Typography variant="h4" gutterBottom>
          Vite SSR, Remix, React Router
        </Typography>
        <CodeBlock code={viteSsrNote} />
        <Typography color="text.secondary" sx={Styles.trailingNote}>
          Before 0.6.0 the package crashed plain-Node imports (a CSS
          side-effect). That&apos;s gone.
        </Typography>
      </Box>
    </Box>
  );
};

export default NextjsGuidePage;

import type { FC } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import IntroPage from "./pages/IntroPage";
import BlocksPage from "./pages/BlocksPage";
import ProvidersPage from "./pages/ProvidersPage";
import MarkersPage from "./pages/MarkersPage";
import PopupsPage from "./pages/PopupsPage";
import ControlsPage from "./pages/ControlsPage";
import InteractionPage from "./pages/InteractionPage";
import RoutesPage from "./pages/RoutesPage";
import ArcsPage from "./pages/ArcsPage";
import ClustersPage from "./pages/ClustersPage";
import LayersPage from "./pages/LayersPage";
import ChoroplethPage from "./pages/ChoroplethPage";
import HexbinPage from "./pages/HexbinPage";
import TimePlaybackPage from "./pages/TimePlaybackPage";
import ExtrusionPage from "./pages/ExtrusionPage";
import ApiPage from "./pages/ApiPage";
import NotFoundPage from "./pages/NotFoundPage";

const App: FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/blocks" element={<BlocksPage />} />
        <Route path="/providers" element={<ProvidersPage />} />
        <Route path="/markers" element={<MarkersPage />} />
        <Route path="/popups" element={<PopupsPage />} />
        <Route path="/controls" element={<ControlsPage />} />
        <Route path="/interaction" element={<InteractionPage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/arcs" element={<ArcsPage />} />
        <Route path="/clusters" element={<ClustersPage />} />
        <Route path="/layers" element={<LayersPage />} />
        <Route path="/choropleth" element={<ChoroplethPage />} />
        <Route path="/hexbins" element={<HexbinPage />} />
        <Route path="/time" element={<TimePlaybackPage />} />
        <Route path="/extrusion" element={<ExtrusionPage />} />
        <Route path="/api" element={<ApiPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
};

export default App;

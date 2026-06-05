import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import { IntroPage } from "./pages/IntroPage";
import { ProvidersPage } from "./pages/ProvidersPage";
import { MarkersPage } from "./pages/MarkersPage";
import { PopupsPage } from "./pages/PopupsPage";
import { ControlsPage } from "./pages/ControlsPage";
import { RoutesPage } from "./pages/RoutesPage";
import { ArcsPage } from "./pages/ArcsPage";
import { ClustersPage } from "./pages/ClustersPage";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/providers" element={<ProvidersPage />} />
        <Route path="/markers" element={<MarkersPage />} />
        <Route path="/popups" element={<PopupsPage />} />
        <Route path="/controls" element={<ControlsPage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/arcs" element={<ArcsPage />} />
        <Route path="/clusters" element={<ClustersPage />} />
      </Routes>
    </Layout>
  );
}

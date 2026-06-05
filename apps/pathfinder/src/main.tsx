import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppThemeProvider } from "./theme";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </StrictMode>,
);

// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { createTheme } from "@mui/material/styles";
import { applyOverlayTheme, injectOverlayStyles } from "./overlayTheme";

const STYLE_SELECTOR = "#zmap-overlay-styles";

afterEach(() => {
  document.querySelectorAll(STYLE_SELECTOR).forEach((node) => {
    node.remove();
  });
});

describe("injectOverlayStyles", () => {
  it("adds exactly one style tag per document", () => {
    injectOverlayStyles();
    injectOverlayStyles();

    expect(document.head.querySelectorAll(STYLE_SELECTOR)).toHaveLength(1);
  });
});

describe("applyOverlayTheme", () => {
  it("writes the CSS variables from the theme", () => {
    const theme = createTheme({ palette: { mode: "dark" } });
    const root = document.createElement("div");

    applyOverlayTheme(root, theme);

    expect(root.style.getPropertyValue("--zmap-popup-bg")).toBe(
      theme.palette.background.paper,
    );
    expect(root.style.getPropertyValue("--zmap-popup-fg")).toBe(
      theme.palette.text.primary,
    );
    expect(root.style.getPropertyValue("--zmap-popup-radius")).toBe(
      `${theme.shape.borderRadius}px`,
    );
    expect(root.style.getPropertyValue("--zmap-popup-shadow")).toBe(
      theme.shadows[6],
    );
    expect(root.style.getPropertyValue("--zmap-popup-padding")).toBe(
      theme.spacing(1.5),
    );
    expect(root.style.getPropertyValue("--zmap-popup-hover")).toBe(
      theme.palette.action.hover,
    );
    expect(root.style.getPropertyValue("--zmap-popup-font")).toBe(
      theme.typography.fontFamily,
    );
  });
});

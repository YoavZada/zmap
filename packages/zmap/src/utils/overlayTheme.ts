import type { Theme } from "@mui/material/styles";

const STYLE_ID = "zmap-overlay-styles";

const CSS = `
.zmap-popup .maplibregl-popup-content {
  background: var(--zmap-popup-bg);
  color: var(--zmap-popup-fg);
  border-radius: var(--zmap-popup-radius);
  box-shadow: var(--zmap-popup-shadow);
  padding: var(--zmap-popup-padding);
  font-family: var(--zmap-popup-font);
}
.zmap-popup .maplibregl-popup-close-button {
  color: var(--zmap-popup-fg);
  font-size: 18px;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 4px;
}
.zmap-popup .maplibregl-popup-close-button:hover {
  background: var(--zmap-popup-hover);
}
.zmap-popup.maplibregl-popup-anchor-top .maplibregl-popup-tip,
.zmap-popup.maplibregl-popup-anchor-top-left .maplibregl-popup-tip,
.zmap-popup.maplibregl-popup-anchor-top-right .maplibregl-popup-tip {
  border-bottom-color: var(--zmap-popup-bg);
}
.zmap-popup.maplibregl-popup-anchor-bottom .maplibregl-popup-tip,
.zmap-popup.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip,
.zmap-popup.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip {
  border-top-color: var(--zmap-popup-bg);
}
.zmap-popup.maplibregl-popup-anchor-left .maplibregl-popup-tip {
  border-right-color: var(--zmap-popup-bg);
}
.zmap-popup.maplibregl-popup-anchor-right .maplibregl-popup-tip {
  border-left-color: var(--zmap-popup-bg);
}
.zmap-popup--tooltip .maplibregl-popup-content {
  padding: 4px 8px;
  font-size: 0.8125rem;
  pointer-events: none;
}
`;

/** Injects the popup/tooltip CSS once per document. */
export function injectOverlayStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

/** Pushes the current MUI theme onto a popup root via CSS variables. */
export function applyOverlayTheme(root: HTMLElement, theme: Theme): void {
  const set = (k: string, v: string) => root.style.setProperty(k, v);
  set("--zmap-popup-bg", theme.palette.background.paper);
  set("--zmap-popup-fg", theme.palette.text.primary);
  set("--zmap-popup-radius", `${theme.shape.borderRadius}px`);
  set("--zmap-popup-shadow", theme.shadows[6]);
  set("--zmap-popup-padding", theme.spacing(1.5));
  set("--zmap-popup-hover", theme.palette.action.hover);
  set(
    "--zmap-popup-font",
    typeof theme.typography.fontFamily === "string"
      ? theme.typography.fontFamily
      : "inherit",
  );
}

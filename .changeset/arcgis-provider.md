---
"zmapgl": minor
---

New `arcgis` basemap provider for Esri's ArcGIS Basemap Styles service (v2). A keyed factory like `maptiler`: `<Map provider={arcgis(apiKey)} />` defaults to `arcgis/light-gray` and tracks the MUI theme by pairing styles with their dark twins (`light-gray` ↔ `dark-gray`, `streets` ↔ `streets-night`, `navigation` ↔ `navigation-night`, `human-geography` ↔ `human-geography-dark`, and the `open/*` equivalents). Styles without a twin render the same in both modes, or pass an explicit `{ light, dark }`. Optional `language`, `worldview` and `places` preferences are forwarded as query params. The provider id never contains the API key. Exports `ArcgisStyle`, `ArcgisStylePair` and `ArcgisOptions`.

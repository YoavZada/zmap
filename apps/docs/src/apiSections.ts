/**
 * The API Reference page's sections, in render order. Single source of truth
 * shared by `pages/ApiPage` (which renders each section) and the contextual
 * "On this page" rail (`layout/Layout/components/ApiToc`), so the TOC can never
 * drift from the page. The `id`s are the in-page anchor targets.
 */
export interface ApiSection {
  id: string;
  label: string;
}

export const apiSections: ApiSection[] = [
  { id: "components", label: "Components" },
  { id: "hooks", label: "Hooks" },
  { id: "providers", label: "Providers" },
  { id: "utilities", label: "Utilities" },
  { id: "types", label: "Types" },
];

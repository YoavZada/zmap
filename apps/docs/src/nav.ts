export interface NavItem {
  path: string;
  label: string;
}

export const navItems: NavItem[] = [
  { path: "/", label: "Introduction" },
  { path: "/providers", label: "Providers & Theming" },
  { path: "/markers", label: "Markers" },
  { path: "/popups", label: "Popups & Tooltips" },
  { path: "/controls", label: "Controls" },
  { path: "/routes", label: "Routes" },
  { path: "/arcs", label: "Arcs" },
  { path: "/clusters", label: "Clusters" },
];

import { themes, type PrismTheme } from "prism-react-renderer";

/**
 * prism-react-renderer's built-in `nightOwl` / `nightOwlLight` themes ship a
 * few token colors that fall short of WCAG AA (4.5:1) against their own
 * `plain.backgroundColor` — confirmed by axe's color-contrast rule against the
 * live docs (tools/e2e/tests/a11y.spec.ts). Patch only those token types;
 * every other color is exactly what the upstream theme ships.
 *
 * Key -> token type(s) that share this color in the theme's `styles` array.
 */
const LIGHT_FIXES: Record<string, string> = {
  // operator/property/keyword/namespace — was #0c969b (3.46:1 on #FBFBFB).
  keyword: "#097579",
  // string/builtin/char/constant/url — was #4876d6 (4.19:1 on #FBFBFB).
  string: "#3f68bc",
  // inserted/attr-name share the same color as `string` above.
  "attr-name": "#3f68bc",
  // was #989fb1 (2.55:1 on #FBFBFB).
  comment: "#6a6f7c",
};

const DARK_FIXES: Record<string, string> = {
  // was #637777 (3.87:1 on #011627).
  comment: "#768787",
};

function withFixes(
  theme: PrismTheme,
  fixes: Record<string, string>,
): PrismTheme {
  return {
    ...theme,
    styles: theme.styles.map((rule) => {
      const fixKey = rule.types.find((t) => t in fixes);
      return fixKey
        ? { ...rule, style: { ...rule.style, color: fixes[fixKey] } }
        : rule;
    }),
  };
}

/** AA-contrast-safe variants of prism-react-renderer's night-owl themes. */
export const accessibleNightOwlLight = withFixes(
  themes.nightOwlLight,
  LIGHT_FIXES,
);
export const accessibleNightOwl = withFixes(themes.nightOwl, DARK_FIXES);

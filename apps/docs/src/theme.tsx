import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type FC,
} from "react";
import { createTheme, ThemeProvider, type Theme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type Mode = "light" | "dark";

/* ------------------------------------------------------------------ *
 * Design tokens — "Technical Precision"
 *
 * The source palette (light) plus a derived dark set following the
 * design notes: deep-slate surfaces, slate-800 borders, the inverse
 * primary as the accent. Consume these in `*.style.ts` files via the
 * augmented `theme.tokens.*` (e.g. `(theme) => ({ bgcolor: theme.tokens.surfaceContainer })`).
 * ------------------------------------------------------------------ */
export interface DesignTokens {
  // Surfaces (tonal elevation layers)
  surface: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  // Content
  onSurface: string;
  onSurfaceVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  // Lines
  outline: string;
  outlineVariant: string;
  // Accents (container tones)
  primaryContainer: string;
  onPrimaryContainer: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  tertiaryContainer: string;
  // Code + neutral scale
  codeBg: string;
  slate50: string;
  slate200: string;
  slate800: string;
  // Composed values
  previewGradient: string;
  cardShadow: string;
}

// Both modes are cut from the same slate ramp so light and dark share one
// character: a cool neutral page, panels one step brighter, hairline slate
// borders, and a single indigo→pink accent pair reused everywhere.
const lightTokens: DesignTokens = {
  surface: "#f6f8fb",
  surfaceDim: "#e2e8f0",
  surfaceBright: "#ffffff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f1f5f9",
  surfaceContainer: "#e9eef5",
  surfaceContainerHigh: "#e2e8f0",
  surfaceContainerHighest: "#d8e0ea",
  onSurface: "#0f172a",
  onSurfaceVariant: "#475569",
  inverseSurface: "#0f172a",
  inverseOnSurface: "#f1f5f9",
  outline: "#64748b",
  outlineVariant: "#cbd5e1",
  primaryContainer: "#e0e7ff",
  onPrimaryContainer: "#312e81",
  secondaryContainer: "#fce7f3",
  onSecondaryContainer: "#831843",
  tertiary: "#0e7490",
  tertiaryContainer: "#cffafe",
  codeBg: "#011627",
  slate50: "#f8fafc",
  slate200: "#e2e8f0",
  slate800: "#1e293b",
  previewGradient:
    "linear-gradient(135deg, rgba(79,70,229,0.045) 0%, rgba(219,39,119,0.045) 100%)",
  cardShadow:
    "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.10)",
};

// Dark mirrors the same ramp: near-black slate page, panels a step lighter
// (not darker), muted slate-400 secondary text.
const darkTokens: DesignTokens = {
  surface: "#0b1120",
  surfaceDim: "#080d18",
  surfaceBright: "#243044",
  surfaceContainerLowest: "#0f172a",
  surfaceContainerLow: "#111a2e",
  surfaceContainer: "#151f33",
  surfaceContainerHigh: "#1e293b",
  surfaceContainerHighest: "#273349",
  onSurface: "#f1f5f9",
  onSurfaceVariant: "#94a3b8",
  inverseSurface: "#f1f5f9",
  inverseOnSurface: "#0f172a",
  outline: "#64748b",
  outlineVariant: "#1e293b",
  primaryContainer: "#312e81",
  onPrimaryContainer: "#e0e7ff",
  secondaryContainer: "#831843",
  onSecondaryContainer: "#fce7f3",
  tertiary: "#67e8f9",
  tertiaryContainer: "#155e75",
  codeBg: "#011627",
  slate50: "#f8fafc",
  slate200: "#e2e8f0",
  slate800: "#1e293b",
  previewGradient:
    "linear-gradient(135deg, rgba(129,140,248,0.07) 0%, rgba(244,114,182,0.06) 100%)",
  cardShadow:
    "0 1px 2px rgba(0,0,0,0.35), 0 10px 30px -12px rgba(0,0,0,0.55)",
};

export const SANS = '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif';
export const MONO =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

// Make the tokens available as `theme.tokens.*` everywhere.
declare module "@mui/material/styles" {
  interface Theme {
    tokens: DesignTokens;
  }
  interface ThemeOptions {
    tokens?: DesignTokens;
  }
}

function buildTheme(mode: Mode): Theme {
  const t = mode === "light" ? lightTokens : darkTokens;

  return createTheme({
    tokens: t,
    palette: {
      mode,
      // One accent pair across both modes: indigo lead, pink support — the
      // dark values are the same hues, two steps lighter.
      primary: { main: mode === "light" ? "#4f46e5" : "#818cf8" },
      secondary: { main: mode === "light" ? "#db2777" : "#f472b6" },
      error: { main: mode === "light" ? "#dc2626" : "#f87171" },
      background: { default: t.surface, paper: t.surfaceContainerLowest },
      text: { primary: t.onSurface, secondary: t.onSurfaceVariant },
      divider: mode === "light" ? t.slate200 : t.slate800,
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: SANS,
      h1: { fontWeight: 800, fontSize: "3rem", letterSpacing: "-0.04em" },
      h2: { fontWeight: 800, fontSize: "2.25rem", letterSpacing: "-0.04em" },
      h3: { fontWeight: 700, fontSize: "1.875rem", letterSpacing: "-0.03em" },
      h4: { fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.02em" },
      h5: { fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.01em" },
      h6: { fontWeight: 700, fontSize: "1.125rem" },
      subtitle1: { fontSize: "1.125rem", lineHeight: 1.55 },
      body1: { fontSize: "1rem", lineHeight: 1.6 },
      body2: { fontSize: "0.875rem", lineHeight: 1.55 },
      button: { textTransform: "none", fontWeight: 600 },
      overline: {
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
        lineHeight: 1.4,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // Slim, rounded scrollbars and a brand-tinted selection — the kind
          // of detail that quietly upgrades the whole page.
          "*::-webkit-scrollbar": { width: 10, height: 10 },
          "*::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            border: "2px solid transparent",
            backgroundClip: "content-box",
            backgroundColor: mode === "dark" ? "#334155" : "#c2c6d6",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor: mode === "dark" ? "#475569" : "#8b93a7",
          },
          "*::-webkit-scrollbar-corner": { background: "transparent" },
          "::selection": {
            backgroundColor:
              mode === "dark"
                ? "rgba(129,140,248,0.32)"
                : "rgba(79,70,229,0.16)",
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        // Kill MUI's dark-mode elevation gradient — tonal tokens already
        // encode depth, and the overlay reads muddy on top of them.
        styleOverrides: { root: { backgroundImage: "none" } },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontSize: "0.75rem",
            fontWeight: 500,
            paddingInline: 10,
            paddingBlock: 5,
            backgroundColor: mode === "dark" ? "#273349" : "#1e293b",
          },
        },
      },
    },
  });
}

interface ColorModeValue {
  mode: Mode;
  toggle: () => void;
}

const ColorModeContext = createContext<ColorModeValue>({
  mode: "dark",
  toggle: () => {},
});

export function useColorMode() {
  return useContext(ColorModeContext);
}

export const AppThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>("dark");

  const colorMode = useMemo<ColorModeValue>(
    () => ({
      mode,
      toggle: () => setMode((m) => (m === "light" ? "dark" : "light")),
    }),
    [mode],
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

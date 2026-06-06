import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
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

const lightTokens: DesignTokens = {
  surface: "#faf8ff",
  surfaceDim: "#d2d9f4",
  surfaceBright: "#faf8ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f2f3ff",
  surfaceContainer: "#eaedff",
  surfaceContainerHigh: "#e2e7ff",
  surfaceContainerHighest: "#dae2fd",
  onSurface: "#131b2e",
  onSurfaceVariant: "#424754",
  inverseSurface: "#283044",
  inverseOnSurface: "#eef0ff",
  outline: "#727785",
  outlineVariant: "#c2c6d6",
  primaryContainer: "#2170e4",
  onPrimaryContainer: "#fefcff",
  secondaryContainer: "#fd56a7",
  onSecondaryContainer: "#600037",
  tertiary: "#924700",
  tertiaryContainer: "#b75b00",
  codeBg: "#011627",
  slate50: "#f8fafc",
  slate200: "#e2e8f0",
  slate800: "#1e293b",
  previewGradient:
    "linear-gradient(135deg, rgba(0,88,190,0.05) 0%, rgba(180,19,109,0.05) 100%)",
  cardShadow: "0px 4px 6px -1px rgba(19,27,46,0.08)",
};

// Dark set — deep slate surfaces, slate-800 borders, inverse-primary accent.
const darkTokens: DesignTokens = {
  surface: "#0f172a",
  surfaceDim: "#0b1120",
  surfaceBright: "#243044",
  surfaceContainerLowest: "#0b1120",
  surfaceContainerLow: "#131b2e",
  surfaceContainer: "#1a2336",
  surfaceContainerHigh: "#1e293b",
  surfaceContainerHighest: "#27324a",
  onSurface: "#eef0ff",
  onSurfaceVariant: "#c2c6d6",
  inverseSurface: "#eef0ff",
  inverseOnSurface: "#131b2e",
  outline: "#8b93a7",
  outlineVariant: "#1e293b",
  primaryContainer: "#004395",
  onPrimaryContainer: "#d8e2ff",
  secondaryContainer: "#8c0053",
  onSecondaryContainer: "#ffd9e4",
  tertiary: "#ffb786",
  tertiaryContainer: "#723600",
  codeBg: "#011627",
  slate50: "#f8fafc",
  slate200: "#e2e8f0",
  slate800: "#1e293b",
  previewGradient:
    "linear-gradient(135deg, rgba(173,198,255,0.08) 0%, rgba(255,176,205,0.08) 100%)",
  cardShadow: "0px 4px 6px -1px rgba(0,0,0,0.4)",
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
      primary: { main: mode === "light" ? "#0058be" : "#adc6ff" },
      secondary: { main: mode === "light" ? "#b4136d" : "#ffb0cd" },
      error: { main: mode === "light" ? "#ba1a1a" : "#ffb4ab" },
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
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiPaper: { defaultProps: { elevation: 0 } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
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

export function AppThemeProvider({ children }: { children: ReactNode }) {
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
}

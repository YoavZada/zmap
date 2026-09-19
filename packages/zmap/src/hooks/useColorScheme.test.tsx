// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useColorScheme, type ColorScheme } from "./useColorScheme";

function renderColorScheme(mode: "light" | "dark", scheme: ColorScheme) {
  const theme = createTheme({ palette: { mode } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );
  return renderHook(() => useColorScheme(scheme), { wrapper });
}

describe("useColorScheme", () => {
  it('"auto" follows theme.palette.mode', () => {
    const dark = renderColorScheme("dark", "auto");
    expect(dark.result.current).toBe("dark");

    const light = renderColorScheme("light", "auto");
    expect(light.result.current).toBe("light");
  });

  it("explicit scheme ignores the theme", () => {
    const lightOnDarkTheme = renderColorScheme("dark", "light");
    expect(lightOnDarkTheme.result.current).toBe("light");

    const darkOnLightTheme = renderColorScheme("light", "dark");
    expect(darkOnLightTheme.result.current).toBe("dark");
  });
});

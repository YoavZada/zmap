// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import type { FC } from "react";
import { describe, expect, it } from "vitest";
import { enUS } from "../locales";
import { LocaleContext } from "./LocaleContext";
import { useLocale, useLocaleText } from "./useLocaleText";

const Probe: FC = () => {
  const t = useLocaleText();
  const locale = useLocale();
  return (
    <div data-testid="probe">{`${t.zoomIn}|${t.zoomOut}|${locale ?? ""}`}</div>
  );
};

describe("useLocaleText / useLocale", () => {
  it("returns enUS outside <Map>", () => {
    render(<Probe />);
    expect(screen.getByTestId("probe").textContent).toBe(
      `${enUS.zoomIn}|${enUS.zoomOut}|`,
    );
  });

  it("localeText partially overrides enUS inside <Map>", () => {
    render(
      <LocaleContext.Provider
        value={{ text: { ...enUS, zoomIn: "Zoom!" }, locale: "he-IL" }}
      >
        <Probe />
      </LocaleContext.Provider>,
    );
    // Overridden key wins, un-overridden key still falls back to enUS.
    expect(screen.getByTestId("probe").textContent).toBe(
      `Zoom!|${enUS.zoomOut}|he-IL`,
    );
  });
});

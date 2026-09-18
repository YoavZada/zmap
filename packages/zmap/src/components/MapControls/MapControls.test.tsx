// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MapContext } from "../../context/MapContext";
import { LocaleContext } from "../../context/LocaleContext";
import { heIL } from "../../locales";
import MapControls from "./MapControls";

describe("MapControls locale", () => {
  it("renders heIL aria-labels when localeText={heIL}", () => {
    render(
      <MapContext.Provider value={{ map: null, loaded: false }}>
        <LocaleContext.Provider value={{ text: heIL }}>
          <MapControls />
        </LocaleContext.Provider>
      </MapContext.Provider>,
    );

    expect(screen.getByLabelText(heIL.zoomIn)).toBeTruthy();
    expect(screen.getByLabelText(heIL.zoomOut)).toBeTruthy();
    expect(screen.getByLabelText(heIL.resetBearingLabel)).toBeTruthy();
    expect(screen.getByLabelText(heIL.myLocationLabel)).toBeTruthy();
    expect(screen.getByLabelText(heIL.toggleFullscreenLabel)).toBeTruthy();
  });
});

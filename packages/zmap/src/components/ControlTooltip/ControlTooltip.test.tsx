// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PortalContainerContext } from "../../context/PortalContainerContext";
import ControlTooltip from "./ControlTooltip";

describe("ControlTooltip", () => {
  it("portals into the map container instead of document.body", () => {
    const mapContainer = document.createElement("div");
    document.body.appendChild(mapContainer);

    render(
      <PortalContainerContext.Provider value={mapContainer}>
        <ControlTooltip title="Zoom in" open placement="left">
          <button type="button">Zoom in</button>
        </ControlTooltip>
      </PortalContainerContext.Provider>,
    );

    expect(mapContainer.querySelector('[role="tooltip"]')).not.toBeNull();

    // The default MUI Popper target is a new element appended directly to
    // document.body. Confirm the only direct body child holding the tooltip
    // is the map container we provided — not a stray body-level portal.
    const directBodyChildrenWithTooltip = Array.from(
      document.body.children,
    ).filter(
      (el) =>
        el.matches('[role="tooltip"]') || el.querySelector('[role="tooltip"]'),
    );
    expect(directBodyChildrenWithTooltip).toEqual([mapContainer]);
  });

  it("still renders with no container (outside <Map>)", () => {
    render(
      <ControlTooltip title="Zoom in" open placement="left">
        <button type="button">Zoom in</button>
      </ControlTooltip>,
    );
    expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  });
});

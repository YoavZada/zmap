// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LayerRegistryProvider } from "../../context/LayerRegistryContext";
import LayerControl from "./LayerControl";

describe("LayerControl a11y", () => {
  it("marks each group container with role=group and aria-labelledby", () => {
    render(
      <LayerRegistryProvider>
        <LayerControl
          defaultOpen
          layers={[
            { id: "roads", label: "Roads", group: "Transportation" },
            { id: "rail", label: "Rail", group: "Transportation" },
            { id: "parks", label: "Parks", group: "Landmarks" },
          ]}
        />
      </LayerRegistryProvider>,
    );

    // Groups should have role=group with aria-labelledby
    const groups = screen.getAllByRole("group");
    expect(groups.length).toBeGreaterThan(0);

    for (const group of groups) {
      expect(group.getAttribute("aria-labelledby")).toBeTruthy();
    }
  });
});

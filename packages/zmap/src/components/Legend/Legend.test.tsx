// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Legend from "./Legend";

describe("Legend a11y", () => {
  it("exposes the legend as a labeled img region", () => {
    render(
      <Legend
        title="Population"
        items={[
          { color: "#f00", label: "High" },
          { color: "#00f", label: "Low" },
        ]}
      />,
    );
    const region = screen.getByRole("img");
    expect(region.getAttribute("aria-label")).toMatch(/Population/);
    expect(region.getAttribute("aria-label")).toMatch(/2/); // count of categories
  });
});

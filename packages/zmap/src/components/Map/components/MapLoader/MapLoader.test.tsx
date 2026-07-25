// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MapLoader from "./MapLoader";

describe("MapLoader", () => {
  it("renders a status region with a spinner by default (overlay)", () => {
    const { container } = render(<MapLoader />);
    expect(screen.getByRole("status")).toBeDefined();
    expect(screen.getByRole("progressbar")).toBeDefined();
    expect(container.querySelector(".MuiCircularProgress-root")).not.toBeNull();
  });

  it("renders a spinner for the spinner variant", () => {
    const { container } = render(<MapLoader variant="spinner" />);
    expect(container.querySelector(".MuiCircularProgress-root")).not.toBeNull();
  });

  it("renders a linear bar for the bar variant", () => {
    const { container } = render(<MapLoader variant="bar" />);
    expect(screen.getByRole("progressbar")).toBeDefined();
    expect(container.querySelector(".MuiLinearProgress-root")).not.toBeNull();
    expect(container.querySelector(".MuiCircularProgress-root")).toBeNull();
  });

  it("renders the label and uses it as the accessible name", () => {
    render(<MapLoader label="Loading tiles…" />);
    expect(screen.getByText("Loading tiles…")).toBeDefined();
    expect(
      screen.getByRole("status", { name: "Loading tiles…" }),
    ).toBeDefined();
  });

  it("falls back to a default accessible name without a label", () => {
    render(<MapLoader />);
    expect(screen.getByRole("status", { name: "Loading map" })).toBeDefined();
  });

  it("is determinate when progress is provided", () => {
    render(<MapLoader progress={42} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("42");
  });

  it("clamps out-of-range progress to 0–100", () => {
    render(<MapLoader progress={150} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "100",
    );
  });

  it("is indeterminate without progress (no aria-valuenow)", () => {
    render(<MapLoader />);
    expect(
      screen.getByRole("progressbar").getAttribute("aria-valuenow"),
    ).toBeNull();
  });
});

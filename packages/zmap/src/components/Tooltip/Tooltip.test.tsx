// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

// Mock Popup to test Tooltip's role="tooltip" wrapping
vi.mock("../Popup", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="popup-wrapper">{children}</div>
  ),
}));

import Tooltip from "./Tooltip";

describe("Tooltip a11y", () => {
  it("wraps content with role=tooltip", () => {
    const { getByRole } = render(
      <Tooltip longitude={0} latitude={0}>
        <span>Tooltip text</span>
      </Tooltip>,
    );

    const tooltip = getByRole("tooltip");
    expect(tooltip).toBeDefined();
  });
});

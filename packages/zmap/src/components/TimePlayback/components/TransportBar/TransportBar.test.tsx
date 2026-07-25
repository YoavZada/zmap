// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TransportBar from "./TransportBar";

describe("TransportBar a11y", () => {
  it("labels the speed button with current speed", () => {
    render(
      <TransportBar
        position="bottom-right"
        playing={false}
        atEnd={false}
        playhead={50}
        min={0}
        max={100}
        speed={1.5}
        format={(value) => String(value)}
        onToggle={() => {}}
        onScrub={() => {}}
        onCycleSpeed={() => {}}
      />,
    );
    const speedButton = screen.getByRole("button", {
      name: /Playback speed: 1.5×/,
    });
    expect(speedButton).toBeDefined();
  });
});

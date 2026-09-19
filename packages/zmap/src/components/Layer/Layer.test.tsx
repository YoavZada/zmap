// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FC } from "react";
import { LayerRegistryProvider } from "../../context/LayerRegistryContext";
import { useLayerRegistry } from "../../context/useLayerRegistry";
import Layer from "./Layer";

/** Reads the registry and renders its entries as plain text for assertions. */
const RegistryProbe: FC = () => {
  const { entries } = useLayerRegistry();
  return (
    <div data-testid="entries">
      {JSON.stringify(
        entries.map((e) => ({ id: e.id, label: e.label, visible: e.visible })),
      )}
    </div>
  );
};

/** Flips a layer's visibility in the registry, standing in for <LayerControl>. */
const ToggleButton: FC<{ id: string; to: boolean }> = ({ id, to }) => {
  const { setVisible } = useLayerRegistry();
  return (
    <button type="button" onClick={() => setVisible(id, to)}>
      toggle
    </button>
  );
};

describe("Layer", () => {
  it("registers in the layer registry on mount and unregisters on unmount", () => {
    const { rerender, getByTestId } = render(
      <LayerRegistryProvider>
        <RegistryProbe />
        <Layer id="roads" label="Roads" />
      </LayerRegistryProvider>,
    );

    expect(getByTestId("entries").textContent).toContain("roads");

    rerender(
      <LayerRegistryProvider>
        <RegistryProbe />
      </LayerRegistryProvider>,
    );

    expect(getByTestId("entries").textContent).not.toContain("roads");
  });

  it("controlled visible mirrors into the registry and calls onVisibleChange when toggled", () => {
    const onVisibleChange = vi.fn();
    const { getByTestId, getByRole } = render(
      <LayerRegistryProvider>
        <RegistryProbe />
        <Layer
          id="rail"
          label="Rail"
          visible
          onVisibleChange={onVisibleChange}
        />
        <ToggleButton id="rail" to={false} />
      </LayerRegistryProvider>,
    );

    expect(JSON.parse(getByTestId("entries").textContent ?? "[]")).toEqual([
      { id: "rail", label: "Rail", visible: true },
    ]);

    // Simulates <LayerControl> flipping the registry entry directly.
    fireEvent.click(getByRole("button", { name: "toggle" }));

    expect(JSON.parse(getByTestId("entries").textContent ?? "[]")).toEqual([
      { id: "rail", label: "Rail", visible: false },
    ]);
    expect(onVisibleChange).toHaveBeenCalledWith(false);
  });

  it("hides children when not visible", () => {
    render(
      <LayerRegistryProvider>
        <Layer id="parks" label="Parks" visible={false}>
          <div data-testid="parks-child" />
        </Layer>
      </LayerRegistryProvider>,
    );

    expect(screen.queryByTestId("parks-child")).toBeNull();
  });
});

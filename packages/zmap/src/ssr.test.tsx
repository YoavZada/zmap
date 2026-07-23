import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Map from "./components/Map";
import Marker from "./components/Marker";

// Node environment (no jsdom, no mocked maplibre): proves the public
// surface server-renders without touching window/document. Children gate
// on the map "load" event, which never fires server-side.
describe("server-side rendering", () => {
  it("renderToString renders the container and defers children", () => {
    const html = renderToString(
      <Map center={[0, 0]} zoom={2}>
        <Marker longitude={0} latitude={0}>
          <span>marker child</span>
        </Marker>
      </Map>,
    );
    expect(html).toContain('aria-label="Interactive map"');
    expect(html).not.toContain("marker child");
  });
});

import { useEffect, useState } from "react";

/**
 * Reveal-on-scroll for expensive content (each demo is a full MapLibre WebGL
 * context): `revealed` flips true once the ref'd element scrolls near the
 * viewport, and stays true — so maps mount once and never re-initialise (or
 * re-fetch tiles) on scroll. Attach `ref` to the placeholder container; it's a
 * callback ref, so it also survives the element unmounting and coming back
 * (e.g. a Preview/Code tab switch).
 */
export function useRevealOnScroll(): {
  ref: (node: HTMLElement | null) => void;
  revealed: boolean;
} {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (revealed || !node) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      // Mount a little before it enters view so the map is ready on arrival.
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed, node]);

  return { ref: setNode, revealed };
}

import {
  useEffect,
  useRef,
  type DependencyList,
  type EffectCallback,
} from "react";

/**
 * Like `useEffect`, but skips the first run (the mount) — only fires on
 * subsequent dependency changes. Used for props that are already applied at
 * creation time (e.g. a MapLibre constructor option) and only need to be
 * re-applied reactively after that.
 *
 * Implemented with a ref flag. Under React StrictMode's dev-only
 * double-invoke of effects, each simulated mount still only skips once (the
 * flag isn't reset between the two passes) — fine here, since callers only
 * need "not on the very first real mount", not "not on any mount-shaped
 * pass".
 */
export function useUpdateEffect(
  effect: EffectCallback,
  deps: DependencyList,
): void {
  const isMount = useRef(true);
  useEffect(() => {
    if (isMount.current) {
      isMount.current = false;
      return;
    }
    return effect();
    // `deps` is a parameter, not an array literal, so biome's
    // useExhaustiveDependencies can't verify it here — that check runs at
    // each call site instead (biome-ignore comments are added there,
    // when needed, with a reason).
  }, deps);
}

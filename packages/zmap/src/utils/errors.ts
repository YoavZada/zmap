/** Normalizes a caught value into a real `Error`, wrapping non-Error throws. */
export function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}
